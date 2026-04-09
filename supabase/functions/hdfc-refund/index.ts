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

    const { order_id, amount, unique_request_id } = await req.json();
    if (!order_id || !amount) return jsonResponse({ error: "order_id and amount required" }, 400);

    const API_KEY = Deno.env.get("HDFC_API_KEY")!;
    const MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
    const ENVIRONMENT = Deno.env.get("HDFC_ENVIRONMENT") || "sandbox";
    const BASE_URL =
      ENVIRONMENT === "production"
        ? Deno.env.get("HDFC_BASE_URL_PRODUCTION") || "https://smartgateway.hdfc.bank.in"
        : Deno.env.get("HDFC_BASE_URL_SANDBOX") || "https://smartgateway.hdfcuat.bank.in";

    const basicAuth = btoa(API_KEY);
    const reqId = unique_request_id || `REF${Date.now()}`.substring(0, 21);

    // HDFC refund uses form-urlencoded
    const formBody = new URLSearchParams({
      unique_request_id: reqId,
      amount: String(Number(amount).toFixed(2)),
    });

    const res = await fetch(`${BASE_URL}/orders/${order_id}/refunds`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "x-merchantid": MERCHANT_ID,
      },
      body: formBody.toString(),
    });

    const body = await res.text();
    console.log("HDFC refund response:", res.status, body);

    let data: Record<string, any>;
    try {
      data = JSON.parse(body);
    } catch {
      return jsonResponse({ error: "Invalid response from gateway", raw: body }, 502);
    }

    if (!res.ok) {
      return jsonResponse({ error: "Refund failed", details: data }, res.status);
    }

    return jsonResponse({
      status: data.status || "PENDING",
      refund_id: data.id || data.refund_id || reqId,
      amount: data.amount,
      gateway_response: data,
    });
  } catch (err) {
    console.error("hdfc-refund error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
