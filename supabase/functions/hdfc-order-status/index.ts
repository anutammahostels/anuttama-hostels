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
    const { order_id } = await req.json();
    if (!order_id) return jsonResponse({ error: "order_id required" }, 400);

    const API_KEY = Deno.env.get("HDFC_API_KEY")!;
    const MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
    const ENVIRONMENT = Deno.env.get("HDFC_ENVIRONMENT") || "sandbox";
    const BASE_URL =
      ENVIRONMENT === "production"
        ? Deno.env.get("HDFC_BASE_URL_PRODUCTION") || "https://smartgateway.hdfc.bank.in"
        : Deno.env.get("HDFC_BASE_URL_SANDBOX") || "https://smartgateway.hdfcuat.bank.in";

    const basicAuth = btoa(`${API_KEY}:`);

    const res = await fetch(`${BASE_URL}/orders/${order_id}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        "x-merchantid": MERCHANT_ID,
      },
    });

    const body = await res.text();
    console.log("HDFC order status response:", res.status, body);

    let data: Record<string, any>;
    try {
      data = JSON.parse(body);
    } catch {
      return jsonResponse({ error: "Invalid response from gateway", raw: body }, 502);
    }

    // Map HDFC status to our status
    const hdfcStatus = (data.status || "").toUpperCase();
    let mappedStatus = "UNKNOWN";
    if (["CHARGED", "AUTO_REFUNDED"].includes(hdfcStatus)) mappedStatus = "SUCCESS";
    else if (["NEW", "PENDING_VBV", "AUTHORIZING", "COD_INITIATED", "STARTED", "AUTHENTICATION_FAILED"].includes(hdfcStatus)) mappedStatus = "PENDING";
    else if (["AUTHORIZATION_FAILED", "JUSPAY_DECLINED", "NOT_FOUND", "VOIDED"].includes(hdfcStatus)) mappedStatus = "FAILED";

    return jsonResponse({
      order_id: data.order_id || order_id,
      status: mappedStatus,
      hdfc_status: hdfcStatus,
      amount: data.amount,
      txn_id: data.txn_id || null,
      payment_method: data.payment_method || null,
      payment_method_type: data.payment_method_type || null,
      refunded: data.refunded || false,
      amount_refunded: data.amount_refunded || 0,
      gateway_response: data,
    });
  } catch (err) {
    console.error("hdfc-order-status error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
