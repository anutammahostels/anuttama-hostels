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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // --- Auth ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return jsonResponse({ error: "Unauthorized" }, 401);
    const userId = user.id;

    // --- Request body ---
    const { invoice_id, amount, return_url } = await req.json();
    if (!invoice_id || !amount) return jsonResponse({ error: "invoice_id and amount required" }, 400);

    // --- DB lookups ---
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: student } = await adminClient
      .from("students")
      .select("id")
      .eq("user_id", userId)
      .single();
    if (!student) return jsonResponse({ error: "Student record not found" }, 404);

    const { data: invoice } = await adminClient
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .eq("student_id", student.id)
      .single();
    if (!invoice) return jsonResponse({ error: "Invoice not found" }, 404);

    const { data: profile } = await adminClient
      .from("profiles")
      .select("email, phone, full_name")
      .eq("id", userId)
      .single();

    // --- Build order_id ---
    const orderId = `HSTY_${Date.now()}_${invoice.invoice_number.replace(/[^a-zA-Z0-9]/g, "")}`;

    // --- HDFC secrets ---
    const API_KEY = Deno.env.get("HDFC_API_KEY")!;
    const MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
    const ENVIRONMENT = Deno.env.get("HDFC_ENVIRONMENT") || "sandbox";
    const BASE_URL =
      ENVIRONMENT === "production"
        ? Deno.env.get("HDFC_BASE_URL_PRODUCTION") || "https://smartgateway.hdfc.bank.in"
        : Deno.env.get("HDFC_BASE_URL_SANDBOX") || "https://smartgateway.hdfcuat.bank.in";
    const PAYMENT_PAGE_CLIENT_ID =
      Deno.env.get("HDFC_PAYMENT_PAGE_CLIENT_ID") || Deno.env.get("HDFC_CLIENT_ID") || "hdfcmaster";

    // --- Create pending payment record ---
    const { data: payment, error: paymentErr } = await adminClient
      .from("payments")
      .insert({
        invoice_id: invoice.id,
        student_id: student.id,
        property_id:
          (invoice as any).property_id ||
          // fallback: lookup from student's invoices
          invoice_id,
        amount: Number(amount),
        payment_method: "online",
        status: "pending",
        transaction_id: orderId,
        gateway_response: {},
      })
      .select("id, property_id")
      .single();

    if (paymentErr) {
      console.error("Failed to create payment record:", paymentErr);
      return jsonResponse({ error: "Failed to create payment record" }, 500);
    }

    // --- Call HDFC /session ---
    const callbackUrl =
      return_url || `${Deno.env.get("SUPABASE_URL")}/functions/v1/hdfc-payment-callback`;

    const sessionPayload: Record<string, unknown> = {
      order_id: orderId,
      amount: String(Number(amount).toFixed(2)),
      customer_id: student.id.replace(/-/g, "").substring(0, 30),
      customer_email: profile?.email || `student_${student.id}@hostylia.com`,
      customer_phone: profile?.phone || "9999999999",
      payment_page_client_id: PAYMENT_PAGE_CLIENT_ID,
      action: "paymentPage",
      return_url: callbackUrl,
      currency: "INR",
    };

    console.log("HDFC session payload:", JSON.stringify(sessionPayload));

    // Basic Auth: base64(API_KEY:)  — colon after key, empty password
    const basicAuth = btoa(`${API_KEY}:`);

    const hdfcRes = await fetch(`${BASE_URL}/session`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        "x-merchantid": MERCHANT_ID,
        "x-customerid": sessionPayload.customer_id as string,
      },
      body: JSON.stringify(sessionPayload),
    });

    const hdfcBody = await hdfcRes.text();
    console.log("HDFC response status:", hdfcRes.status, "body:", hdfcBody);

    let hdfcData: Record<string, any>;
    try {
      hdfcData = JSON.parse(hdfcBody);
    } catch {
      return jsonResponse({ error: "Invalid response from payment gateway", raw: hdfcBody }, 502);
    }

    if (!hdfcRes.ok) {
      // Update payment to failed
      await adminClient
        .from("payments")
        .update({ status: "failed", gateway_response: hdfcData })
        .eq("id", payment.id);

      return jsonResponse(
        {
          error: "Payment gateway error",
          gateway_status: hdfcRes.status,
          details: hdfcData,
        },
        502
      );
    }

    // Store gateway response
    await adminClient
      .from("payments")
      .update({ gateway_response: hdfcData })
      .eq("id", payment.id);

    // Extract payment URL from HDFC response
    const paymentUrl =
      hdfcData.payment_links?.web ||
      hdfcData.payment_links?.iframe ||
      hdfcData.payment_links?.mobile ||
      null;

    return jsonResponse({
      order_id: orderId,
      payment_url: paymentUrl,
      payment_links: hdfcData.payment_links || null,
      status: hdfcData.status || "CREATED",
      sdk_payload: hdfcData.sdk_payload || null,
    });
  } catch (err) {
    console.error("hdfc-create-session error:", err);
    return jsonResponse({ error: (err as Error).message || "Internal server error" }, 500);
  }
});
