import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HDFC_PUBLIC_KEY = Deno.env.get("HDFC_PUBLIC_KEY")!;

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  try {
    const pemBody = HDFC_PUBLIC_KEY
      .replace("-----BEGIN PUBLIC KEY-----", "")
      .replace("-----END PUBLIC KEY-----", "")
      .replace(/\s/g, "");

    const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      "spki",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      sigBytes,
      new TextEncoder().encode(payload)
    );
  } catch (err) {
    console.error("Signature verification failed:", err);
    return false;
  }
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

function htmlRedirect(targetUrl: string) {
  const safe = targetUrl.replace(/"/g, "&quot;");
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${safe}"><title>Redirecting…</title></head><body><script>window.location.replace(${JSON.stringify(targetUrl)});</script><p>Redirecting to your payment status…</p></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let data: Record<string, any> = {};

    // Pull from query string (HDFC sometimes uses GET redirect)
    for (const [k, v] of url.searchParams.entries()) data[k] = v;

    // Merge body if present
    if (req.method === "POST") {
      const body = await req.text();
      const contentType = req.headers.get("content-type") || "";
      try {
        if (contentType.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams(body);
          for (const [k, v] of params.entries()) data[k] = v;
        } else if (body) {
          const parsed = JSON.parse(body);
          data = { ...data, ...parsed };
        }
      } catch (_) { /* ignore body parse errors */ }
    }

    console.log("HDFC callback received:", req.method, JSON.stringify(data));

    const orderId = data.order_id || data.orderId || "";
    const signature = data.signature || data.resp_hash || "";
    const returnTo =
      data.app_return_to ||
      `https://anuttamahostels.com/student/payment/status${orderId ? `?order_id=${encodeURIComponent(orderId)}` : ""}`;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Always audit-log the raw callback (including GET) so we can prove
    // whether HDFC actually called us.
    await logPayment(adminClient, orderId || "UNKNOWN", "callback", { method: req.method, ...data }, null);

    if (!orderId) {
      // Browser flow: still redirect the user to the status page so they
      // are not stuck on a JSON error.
      return new Response(htmlRedirect(returnTo), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (signature) {
      const verifyData = { ...data };
      delete verifyData.signature;
      delete verifyData.resp_hash;
      const payloadStr = JSON.stringify(verifyData);
      const isValid = await verifySignature(payloadStr, signature);
      if (!isValid) console.warn("Signature verification failed for order:", orderId);
    }

    // Server-to-server re-verify against HDFC and sync DB.
    let verifiedResult: any = null;
    try {
      const verifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/hdfc-order-status`;
      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
        },
        body: JSON.stringify({ order_id: orderId }),
      });
      verifiedResult = await res.json();
      await logPayment(adminClient, orderId, "callback", { verify_call: true }, verifiedResult);
    } catch (e) {
      console.error("Server-side re-verify failed:", e);
    }

    // If the request looks like a browser redirect, send the user to the
    // status page. Otherwise return JSON for programmatic callers.
    const accept = req.headers.get("accept") || "";
    const isBrowser = accept.includes("text/html") || req.method === "GET";

    if (isBrowser) {
      return new Response(htmlRedirect(returnTo), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        order_id: orderId,
        verified_status: verifiedResult?.status || "UNKNOWN",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("hdfc-payment-callback error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
