import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createSign } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HDFC_MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
const HDFC_API_KEY = Deno.env.get("HDFC_API_KEY")!;
const HDFC_CLIENT_ID = Deno.env.get("HDFC_CLIENT_ID")!;
const HDFC_KEY_UUID = Deno.env.get("HDFC_KEY_UUID")!;
const HDFC_PRIVATE_KEY = Deno.env.get("HDFC_PRIVATE_KEY")!;

// HDFC SmartGateway API base URL
const HDFC_API_BASE = "https://smartgateway.hdfcbank.com";

function signJWT(payload: Record<string, unknown>): string {
  const header = { alg: "RS256", typ: "JWT", kid: HDFC_KEY_UUID };

  const toBase64Url = (str: string) =>
    btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const headerB64 = toBase64Url(JSON.stringify(header));
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Use node:crypto which handles both PKCS#1 and PKCS#8 PEM keys
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signatureBuffer = sign.sign(HDFC_PRIVATE_KEY);
  const sigB64 = Buffer.from(signatureBuffer).toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    // Parse request body
    const { invoice_id, amount, return_url } = await req.json();
    if (!invoice_id || !amount) {
      return new Response(
        JSON.stringify({ error: "invoice_id and amount are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin client for DB operations
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify student owns this invoice
    const { data: student } = await adminClient
      .from("students")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!student) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invoice } = await adminClient
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .eq("student_id", student.id)
      .single();

    if (!invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const balance = invoice.total_amount - (invoice.paid_amount || 0);
    if (amount > balance || amount <= 0) {
      return new Response(
        JSON.stringify({ error: `Invalid amount. Balance due: ${balance}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique order_id
    const orderId = `ORD-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    // Get student profile for customer info
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", userId)
      .single();

    // Build HDFC SmartGateway session payload
    const sessionPayload = {
      order_id: orderId,
      amount: amount.toFixed(2),
      customer_id: student.id,
      customer_email: profile?.email || "",
      customer_phone: profile?.phone || "",
      payment_page_client_id: HDFC_CLIENT_ID,
      action: "paymentPage",
      return_url: return_url || `${req.headers.get("origin")}/payment/status`,
    };

    // Sign the payload as JWT
    const token = await signJWT(sessionPayload);

    // Call HDFC SmartGateway session API
    const hdfcResponse = await fetch(`${HDFC_API_BASE}/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-merchantid": HDFC_MERCHANT_ID,
        "x-customerid": student.id,
        "x-api-key": HDFC_API_KEY,
        version: "2025-02-12",
      },
      body: JSON.stringify({
        order_id: orderId,
        amount: amount.toFixed(2),
        customer_id: student.id,
        customer_email: profile?.email || "",
        customer_phone: profile?.phone || "",
        payment_page_client_id: HDFC_CLIENT_ID,
        action: "paymentPage",
        return_url: return_url || `${req.headers.get("origin")}/payment/status`,
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      }),
    });

    let hdfcData: Record<string, unknown>;
    try {
      hdfcData = await hdfcResponse.json();
    } catch {
      const text = await hdfcResponse.text();
      console.error("HDFC non-JSON response:", text);
      return new Response(
        JSON.stringify({ error: "Gateway returned invalid response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hdfcResponse.ok) {
      console.error("HDFC error:", JSON.stringify(hdfcData));
      return new Response(
        JSON.stringify({ error: "Payment gateway error", details: hdfcData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert pending payment record
    await adminClient.from("payments").insert({
      invoice_id: invoice.id,
      student_id: student.id,
      property_id: (invoice as any).property_id || "",
      amount,
      payment_method: "online",
      status: "pending",
      transaction_id: orderId,
      gateway_response: hdfcData,
      payment_label: `HDFC-${orderId}`,
      recorded_by: userId,
    });

    return new Response(
      JSON.stringify({
        order_id: orderId,
        payment_links: hdfcData,
        sdk_payload: {
          requestId: crypto.randomUUID(),
          service: "in.juspay.hyperpay",
          payload: {
            clientId: HDFC_CLIENT_ID,
            amount: amount.toFixed(2),
            merchantId: HDFC_MERCHANT_ID,
            orderId,
            customerId: student.id,
            customerEmail: profile?.email || "",
            customerPhone: profile?.phone || "",
            orderDetails: JSON.stringify(sessionPayload),
            signature: token,
            "merchant_key_id": HDFC_KEY_UUID,
            environment: "production",
          },
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("hdfc-create-order error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
