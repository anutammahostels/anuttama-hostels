import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logPayment(
  client: any,
  orderId: string,
  logType: string,
  request: unknown,
  response: unknown,
) {
  try {
    await client.from("payment_logs").insert({
      order_id: orderId,
      log_type: logType,
      request_payload: request as any,
      response_payload: response as any,
    });
  } catch (e) {
    console.error("payment_logs insert failed:", e);
  }
}

// Map HDFC refund error_code → user-friendly message
function friendlyRefundError(code: string | undefined, message: string | undefined): string {
  const c = (code || "").toLowerCase();
  if (c === "duplicate.call") return "A refund with this request ID was already processed.";
  if (c === "invalid.amount.exceeded") return "Refund amount exceeds the refundable balance.";
  if (c === "invalid amount") return "Refund amount is invalid.";
  if (c === "request.exceeded") return "Maximum refund attempts (25) exceeded for this order.";
  if (c === "invalid.order.not_successful")
    return "Refunds can only be initiated for successful (CHARGED) orders.";
  if (c === "access_denied") return "Gateway access denied. Please contact support.";
  return message || code || "Refund request failed.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth check — admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return jsonResponse({ error: "Unauthorized" }, 401);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify staff role
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const roleList = (roles || []).map((r: any) => r.role);
    const isStaff = roleList.some((r: string) =>
      ["super_admin", "tenant_admin", "warden", "accountant"].includes(r)
    );
    if (!isStaff) return jsonResponse({ error: "Forbidden" }, 403);

    const { order_id, amount, unique_request_id, reason } = await req.json();
    if (!order_id || !amount) return jsonResponse({ error: "order_id and amount required" }, 400);
    if (Number(amount) <= 0) return jsonResponse({ error: "amount must be > 0" }, 400);

    // Look up the original transaction so we can send the SAME customer_id
    // that was used at session creation (HDFC requires header consistency).
    const { data: txn } = await adminClient
      .from("payment_transactions")
      .select("*, invoices(id, student_id)")
      .eq("order_id", order_id)
      .maybeSingle();

    if (!txn) return jsonResponse({ error: "Original transaction not found for this order" }, 404);
    if (txn.status !== "SUCCESS")
      return jsonResponse({ error: "Only successful (CHARGED) orders can be refunded" }, 400);

    const API_KEY = Deno.env.get("HDFC_API_KEY")!;
    const MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
    const RESELLER_ID = Deno.env.get("HDFC_RESELLER_ID") || "hdfc_reseller";
    const ENVIRONMENT = Deno.env.get("HDFC_ENVIRONMENT") || "sandbox";
    const BASE_URL =
      ENVIRONMENT === "production"
        ? Deno.env.get("HDFC_BASE_URL_PRODUCTION") || "https://smartgateway.hdfc.bank.in"
        : Deno.env.get("HDFC_BASE_URL_SANDBOX") || "https://smartgateway.hdfcuat.bank.in";

    const basicAuth = btoa(API_KEY + ":");
    // Spec: unique_request_id < 21 chars, alphanumeric
    const reqId = (unique_request_id || `RF${Date.now()}${Math.floor(Math.random() * 1000)}`)
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 20);

    // HDFC refund accepts JSON body too; using form-urlencoded as in the spec curl
    const formBody = new URLSearchParams({
      unique_request_id: reqId,
      amount: String(Number(amount).toFixed(2)),
    });

    const reqLog = {
      order_id,
      unique_request_id: reqId,
      amount: Number(amount),
      customer_id: txn.customer_id,
    };

    const res = await fetch(`${BASE_URL}/orders/${order_id}/refunds`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "x-merchantid": MERCHANT_ID,
        "x-customerid": txn.customer_id,
        "x-resellerid": RESELLER_ID,
      },
      body: formBody.toString(),
    });

    const body = await res.text();
    console.log("HDFC refund response:", res.status, body);

    let data: Record<string, any>;
    try {
      data = JSON.parse(body);
    } catch {
      await logPayment(adminClient, order_id, "refund", reqLog, { http: res.status, raw: body });
      return jsonResponse({ error: "Invalid response from gateway", raw: body }, 502);
    }

    await logPayment(adminClient, order_id, "refund", reqLog, { http: res.status, body: data });

    if (!res.ok) {
      const message = friendlyRefundError(data.error_code, data.error_message);
      return jsonResponse(
        {
          error: message,
          gateway_error_code: data.error_code || null,
          gateway_status: res.status,
          details: data,
        },
        res.status === 401 ? 502 : res.status
      );
    }

    // Find the matching refund entry in the response
    const refundEntry = Array.isArray(data.refunds)
      ? data.refunds.find((r: any) => r.unique_request_id === reqId) || data.refunds[0]
      : null;

    const refundStatus: string = (refundEntry?.status || "PENDING").toUpperCase();
    const refundAmount = Number(refundEntry?.amount ?? amount);
    const refundRef = refundEntry?.ref || refundEntry?.id || reqId;

    // Persist refund in DB so admin/student UIs can see history
    try {
      const { data: invoiceRow } = await adminClient
        .from("invoices")
        .select("id, student_id")
        .eq("id", txn.invoice_id)
        .maybeSingle();

      // Find a property_id for the refund row
      let propertyId: string | null = null;
      if (invoiceRow?.student_id) {
        const { data: bedData } = await adminClient
          .from("beds")
          .select("rooms(floors(blocks(property_id)))")
          .eq("student_id", invoiceRow.student_id)
          .limit(1)
          .maybeSingle();
        propertyId =
          (bedData as any)?.rooms?.floors?.blocks?.property_id || null;
      }
      if (!propertyId) {
        const { data: anyProp } = await adminClient
          .from("properties").select("id").limit(1).single();
        propertyId = anyProp?.id || null;
      }

      if (invoiceRow && propertyId) {
        await adminClient.from("refunds").insert({
          invoice_id: invoiceRow.id,
          student_id: invoiceRow.student_id,
          property_id: propertyId,
          amount: refundAmount,
          reason: reason || `HDFC refund for order ${order_id}`,
          refund_method: "online",
          status: refundStatus === "SUCCESS" ? "processed" : refundStatus.toLowerCase(),
          processed_by: user.id,
        });
      }
    } catch (dbErr) {
      console.error("Failed to persist refund row:", dbErr);
    }

    return jsonResponse({
      status: refundStatus,
      refund_id: refundRef,
      unique_request_id: reqId,
      amount: refundAmount,
      refund_type: refundEntry?.refund_type || null,
      refund_source: refundEntry?.refund_source || null,
      gateway_response: data,
    });
  } catch (err) {
    console.error("hdfc-refund error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
