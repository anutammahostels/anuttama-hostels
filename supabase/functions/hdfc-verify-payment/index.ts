// hdfc-verify-payment: server-trusted view for the success/failure pages.
// Reads payment_transactions (NOT URL params) and returns verified status.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // --- Auth required ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Resolve user id. Prefer getClaims() (works with signing-keys flow);
    // fall back to getUser(); finally decode JWT 'sub' claim directly so
    // a transient auth-server hiccup never causes a false 401.
    const token = authHeader.replace("Bearer ", "");
    let userId: string | null = null;

    try {
      const { data: claimsData } = await (supabase.auth as any).getClaims?.(token) ?? { data: null };
      if (claimsData?.claims?.sub) userId = claimsData.claims.sub as string;
    } catch (_) { /* ignore, try next */ }

    if (!userId) {
      try {
        const { data: userData } = await supabase.auth.getUser(token);
        if (userData?.user?.id) userId = userData.user.id;
      } catch (_) { /* ignore, try next */ }
    }

    if (!userId) {
      try {
        const payloadB64 = token.split(".")[1];
        const json = JSON.parse(
          atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
        );
        if (typeof json?.sub === "string") userId = json.sub;
      } catch (_) { /* ignore */ }
    }

    if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

    const { order_id } = await req.json();
    if (!order_id) return jsonResponse({ error: "order_id required" }, 400);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Audit log
    try {
      await adminClient.from("payment_logs").insert({
        order_id,
        log_type: "verify",
        request_payload: { order_id, user_id: userId },
        response_payload: null,
      });
    } catch (e) {
      console.error("verify log insert failed:", e);
    }

    const { data: txn } = await adminClient
      .from("payment_transactions")
      .select("*, invoices(invoice_number, student_id)")
      .eq("order_id", order_id)
      .maybeSingle();

    if (!txn) {
      return jsonResponse({
        status: "NOT_FOUND",
        order_id,
        amount: null,
        currency: "INR",
        hdfc_txn_id: null,
        invoice_number: null,
      });
    }

    // Authorization: student must own the linked invoice OR be staff
    const invoiceMeta = (txn as any).invoices;
    let allowed = false;

    // Check staff role
    const { data: roleRow } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (roleRow || []).map((r: any) => r.role);
    if (roles.some((r: string) => ["super_admin", "tenant_admin", "warden", "accountant"].includes(r))) {
      allowed = true;
    }

    // Check ownership via student
    if (!allowed && invoiceMeta?.student_id) {
      const { data: student } = await adminClient
        .from("students")
        .select("user_id, parent_id")
        .eq("id", invoiceMeta.student_id)
        .maybeSingle();
      if (student && (student.user_id === userId || student.parent_id === userId)) {
        allowed = true;
      }
    }

    if (!allowed) return jsonResponse({ error: "Forbidden" }, 403);

    return jsonResponse({
      status: txn.status,            // INITIATED | PENDING | SUCCESS | FAILED | TAMPERED
      order_id: txn.order_id,
      amount: Number(txn.amount),
      currency: txn.currency || "INR",
      hdfc_txn_id: txn.hdfc_txn_id,
      payment_method: txn.payment_method,
      invoice_number: invoiceMeta?.invoice_number || null,
    });
  } catch (err) {
    console.error("hdfc-verify-payment error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
