import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    let data: Record<string, any>;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(body);
      data = Object.fromEntries(params.entries());
    } else {
      data = JSON.parse(body);
    }

    console.log("HDFC callback received:", JSON.stringify(data));

    const orderId = data.order_id || data.orderId;
    const signature = data.signature || data.resp_hash || "";

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Audit log of raw callback
    await logPayment(adminClient, orderId, "callback", data, null);

    // Verify signature if present (informational only)
    if (signature) {
      const verifyData = { ...data };
      delete verifyData.signature;
      delete verifyData.resp_hash;
      const payloadStr = JSON.stringify(verifyData);
      const isValid = await verifySignature(payloadStr, signature);
      if (!isValid) console.warn("Signature verification failed for order:", orderId);
    }

    // --- HARDENED: do NOT trust callback's status.
    //     Re-verify by calling HDFC /orders/{order_id} server-to-server (via hdfc-order-status). ---
    const verifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/hdfc-order-status`;
    let verifiedResult: any = null;
    try {
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

    const verifiedStatus = verifiedResult?.status || "UNKNOWN";

    return new Response(
      JSON.stringify({
        status: "ok",
        order_id: orderId,
        verified_status: verifiedStatus,
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
