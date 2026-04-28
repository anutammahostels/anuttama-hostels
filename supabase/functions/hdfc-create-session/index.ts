import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function randomAlphanum(len: number): string {
  let out = "";
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += ALPHANUM[buf[i] % ALPHANUM.length];
  return out;
}

// Audit-compliant order ID: ANT + 8 random alphanumeric + last 4 digits of timestamp = 15 chars
async function generateUniqueOrderId(adminClient: any): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const ts = String(Date.now());
    const candidate = `ANT${randomAlphanum(8)}${ts.slice(-4)}`;
    const { data: existing } = await adminClient
      .from("payment_transactions")
      .select("id")
      .eq("order_id", candidate)
      .maybeSingle();
    if (!existing) return candidate;
  }
  throw new Error("Failed to generate unique order_id after 5 attempts");
}

async function logPayment(
  adminClient: any,
  orderId: string,
  logType: string,
  request: unknown,
  response: unknown,
) {
  try {
    await adminClient.from("payment_logs").insert({
      order_id: orderId,
      log_type: logType,
      request_payload: request as any,
      response_payload: response as any,
    });
  } catch (e) {
    console.error("payment_logs insert failed:", e);
  }
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

    // --- Request body (amount IGNORED — server computes it) ---
    const { invoice_id, return_url } = await req.json();
    if (!invoice_id) return jsonResponse({ error: "invoice_id required" }, 400);

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

    // --- SERVER-SIDE amount computation (tamper-proof) ---
    const balance = Number(invoice.total_amount) - Number(invoice.paid_amount || 0);
    if (balance <= 0) return jsonResponse({ error: "Invoice already paid" }, 400);

    const { data: profile } = await adminClient
      .from("profiles")
      .select("email, phone, full_name")
      .eq("id", userId)
      .single();

    // --- Generate audit-compliant order ID ---
    const orderId = await generateUniqueOrderId(adminClient);

    // --- HDFC config ---
    const API_KEY = Deno.env.get("HDFC_API_KEY")!;
    const MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
    const ENVIRONMENT = Deno.env.get("HDFC_ENVIRONMENT") || "sandbox";
    const BASE_URL =
      ENVIRONMENT === "production"
        ? Deno.env.get("HDFC_BASE_URL_PRODUCTION") || "https://smartgateway.hdfc.bank.in"
        : Deno.env.get("HDFC_BASE_URL_SANDBOX") || "https://smartgateway.hdfcuat.bank.in";
    const PAYMENT_PAGE_CLIENT_ID =
      Deno.env.get("HDFC_PAYMENT_PAGE_CLIENT_ID") || Deno.env.get("HDFC_CLIENT_ID") || "hdfcmaster";

    // --- Resolve property_id ---
    let propertyId: string | null = null;
    const { data: bedData } = await adminClient
      .from("beds")
      .select("room_id, rooms(floor_id, floors(block_id, blocks(property_id)))")
      .eq("student_id", student.id)
      .limit(1)
      .single();
    if (bedData) {
      const room = (bedData as any).rooms;
      const floor = room?.floors;
      const block = floor?.blocks;
      propertyId = block?.property_id || null;
    }
    if (!propertyId) {
      const { data: existingPayment } = await adminClient
        .from("payments")
        .select("property_id")
        .eq("student_id", student.id)
        .limit(1)
        .single();
      propertyId = existingPayment?.property_id || null;
    }
    if (!propertyId) {
      const { data: firstProp } = await adminClient
        .from("properties")
        .select("id")
        .limit(1)
        .single();
      propertyId = firstProp?.id || null;
    }
    if (!propertyId) return jsonResponse({ error: "No property found" }, 400);

    // --- Validate customer email and phone per HDFC spec ---
    const rawPhone = String(profile?.phone || "").replace(/[^0-9]/g, "");
    const phone10 = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    const emailOk = !!profile?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
    if (!emailOk || phone10.length !== 10) {
      return jsonResponse(
        { error: "Please update your profile with a valid 10-digit phone number and email before paying." },
        400
      );
    }

    // --- Split name into first / last ---
    const fullName = String(profile?.full_name || "").trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = (nameParts[0] || "Student").replace(/[^A-Za-z0-9().\-_]/g, "").slice(0, 50) || "Student";
    const lastName = (nameParts.slice(1).join(" ") || "User").replace(/[^A-Za-z0-9().\-_ ]/g, "").slice(0, 50) || "User";

    // --- customer_id derived from auth.uid (no hardcoding) ---
    const customerId = userId.replace(/-/g, "").substring(0, 30);

    // --- Insert payment_transactions row (server source of truth) BEFORE calling HDFC ---
    const { error: ptErr } = await adminClient.from("payment_transactions").insert({
      order_id: orderId,
      invoice_id: invoice.id,
      customer_id: customerId,
      amount: balance,
      currency: "INR",
      status: "INITIATED",
    });
    if (ptErr) {
      console.error("payment_transactions insert failed:", ptErr);
      return jsonResponse({ error: "Failed to create transaction record" }, 500);
    }

    // --- Create pending payment record (kept for backward compatibility) ---
    const { data: payment, error: paymentErr } = await adminClient
      .from("payments")
      .insert({
        invoice_id: invoice.id,
        student_id: student.id,
        property_id: propertyId,
        amount: balance,
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

    // Link payment_transactions → payments
    await adminClient
      .from("payment_transactions")
      .update({ payment_id: payment.id })
      .eq("order_id", orderId);

    // --- Call HDFC /session ---
    // Always send HDFC to the backend callback bridge first. The bridge
    // verifies the order server-side, then redirects the user back to the
    // original frontend status page on the SAME origin they started from.
    // This keeps the auth session intact (no cross-domain bouncing) and
    // makes the success/processing/failed states deterministic.
    const appReturnTo =
      return_url || `${new URL(req.url).origin}/student/payment/status`;

    // IMPORTANT: HDFC automatically appends order_id and customer_id to the
    // return_url on redirect. If we ALSO put them in the URL ourselves, HDFC
    // joins them with a comma (e.g. "ANT123,ANT123"), which breaks signature
    // verification and the subsequent /orders/{id} lookup. So we only pass
    // app_return_to here and let HDFC append the rest.
    const backendCallbackBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1/hdfc-payment-callback`;
    const enrichedReturnUrl =
      `${backendCallbackBase}` +
      `?app_return_to=${encodeURIComponent(appReturnTo)}`;

    const sessionPayload: Record<string, unknown> = {
      order_id: orderId,
      amount: String(balance.toFixed(2)),
      customer_id: customerId,
      customer_email: profile!.email,
      customer_phone: phone10,
      payment_page_client_id: PAYMENT_PAGE_CLIENT_ID,
      action: "paymentPage",
      return_url: enrichedReturnUrl,
      currency: "INR",
      description: `Hostel fee — invoice ${invoice.invoice_number}`.slice(0, 200),
      first_name: firstName,
      last_name: lastName,
      // UDFs for reconciliation in HDFC dashboard & webhooks.
      // NOTE: Per HDFC integration checklist, udf2 is reserved/blocked for
      // tokenization and MUST NOT be used for additional info. We leave it
      // empty and put the student id in udf4 instead.
      udf1: invoice.id,
      udf2: "",
      udf3: propertyId,
      udf4: student.id,
      udf6: invoice.invoice_number || "",
    };

    console.log("HDFC session payload:", JSON.stringify(sessionPayload));

    const basicAuth = btoa(API_KEY + ":");
    const RESELLER_ID = Deno.env.get("HDFC_RESELLER_ID") || "hdfc_reseller";

    const hdfcRes = await fetch(`${BASE_URL}/session`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        "x-merchantid": MERCHANT_ID,
        "x-customerid": sessionPayload.customer_id as string,
        "x-resellerid": RESELLER_ID,
      },
      body: JSON.stringify(sessionPayload),
    });

    const hdfcBody = await hdfcRes.text();
    console.log("HDFC response status:", hdfcRes.status, "body:", hdfcBody);

    let hdfcData: Record<string, any>;
    try {
      hdfcData = JSON.parse(hdfcBody);
    } catch {
      await logPayment(adminClient, orderId, "session_create", sessionPayload, { raw: hdfcBody, http: hdfcRes.status });
      return jsonResponse({ error: "Invalid response from payment gateway", raw: hdfcBody }, 502);
    }

    // Audit log of session create
    await logPayment(adminClient, orderId, "session_create", sessionPayload, { http: hdfcRes.status, body: hdfcData });

    if (!hdfcRes.ok) {
      await adminClient
        .from("payments")
        .update({ status: "failed", gateway_response: hdfcData })
        .eq("id", payment.id);
      await adminClient
        .from("payment_transactions")
        .update({ status: "FAILED" })
        .eq("order_id", orderId);

      return jsonResponse(
        {
          error: "Payment gateway error",
          gateway_status: hdfcRes.status,
          details: hdfcData,
        },
        502
      );
    }

    await adminClient
      .from("payments")
      .update({ gateway_response: hdfcData })
      .eq("id", payment.id);

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
      amount: balance,
    });
  } catch (err) {
    console.error("hdfc-create-session error:", err);
    return jsonResponse({ error: (err as Error).message || "Internal server error" }, 500);
  }
});
