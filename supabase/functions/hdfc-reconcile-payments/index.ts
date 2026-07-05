// Periodic reconciliation: finds stuck/pending HDFC payments and re-runs the
// order-status sync so any invoice showing overdue/pending after a successful
// gateway charge (or vice versa) self-corrects.
//
// Trigger: pg_cron every 15 minutes (see migration). Also callable manually.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const started = Date.now();
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Look-back window (default 7 days). Can be overridden via ?days=N.
  const url = new URL(req.url);
  const days = Math.min(30, Math.max(1, Number(url.searchParams.get("days") || "7")));
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const orderIds = new Set<string>();

  // 1) Pending online payments in the window (these have transaction_id = HDFC order id)
  const { data: pendingPayments, error: e1 } = await admin
    .from("payments")
    .select("id, transaction_id, created_at")
    .eq("status", "pending")
    .eq("payment_method", "online")
    .not("transaction_id", "is", null)
    .gte("created_at", sinceIso)
    .limit(500);
  if (e1) console.error("pendingPayments query failed:", e1);
  (pendingPayments || []).forEach(p => {
    if (p.transaction_id) orderIds.add(p.transaction_id);
  });

  // 2) Payment transactions still INITIATED/PENDING in the window
  const { data: pendingTxns, error: e2 } = await admin
    .from("payment_transactions")
    .select("order_id, status, created_at")
    .in("status", ["INITIATED", "PENDING"])
    .gte("created_at", sinceIso)
    .limit(500);
  if (e2) console.error("pendingTxns query failed:", e2);
  (pendingTxns || []).forEach(t => {
    if (t.order_id) orderIds.add(t.order_id);
  });

  // 3) Safety net: overdue invoices in the window that have any pending online
  // payment attempt — the order id might be linked via payment_transactions.
  const { data: overdueInvoices } = await admin
    .from("invoices")
    .select("id, status, due_date")
    .in("status", ["overdue", "pending"])
    .gte("updated_at", sinceIso)
    .limit(500);
  if (overdueInvoices && overdueInvoices.length > 0) {
    const invIds = overdueInvoices.map(i => i.id);
    const { data: linkedTxns } = await admin
      .from("payment_transactions")
      .select("order_id, status")
      .in("invoice_id", invIds)
      .not("status", "eq", "SUCCESS")
      .not("status", "eq", "FAILED")
      .not("status", "eq", "TAMPERED");
    (linkedTxns || []).forEach(t => t.order_id && orderIds.add(t.order_id));
  }

  const results = { checked: 0, updated: 0, unchanged: 0, errors: 0 };
  const details: Array<Record<string, unknown>> = [];

  // Call hdfc-order-status one order at a time — that function handles all
  // downstream sync (payments, invoices, accounting, notifications) idempotently.
  for (const orderId of orderIds) {
    results.checked++;
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/hdfc-order-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_KEY,
        },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json().catch(() => ({}));
      const status = (data as any)?.status || (data as any)?.hdfc_status || "UNKNOWN";
      if (status === "SUCCESS" || status === "FAILED" || status === "TAMPERED") {
        results.updated++;
      } else {
        results.unchanged++;
      }
      details.push({ order_id: orderId, status });
    } catch (err) {
      results.errors++;
      details.push({ order_id: orderId, error: (err as Error).message });
      console.error("reconcile call failed for", orderId, err);
    }
  }

  // Log a summary row for auditability.
  try {
    await admin.from("payment_logs").insert({
      order_id: `RECONCILE-${Date.now()}`,
      log_type: "status_api",
      request_payload: { reconcile: true, days, window_start: sinceIso },
      response_payload: { ...results, took_ms: Date.now() - started, details },
    });
  } catch (e) {
    console.error("reconcile summary log failed:", e);
  }

  return json({ ok: true, days, ...results, took_ms: Date.now() - started });
});
