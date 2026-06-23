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

  // Always respond 200 — HDFC retries on non-200
  try {
    // --- Basic Auth check for webhook ---
    const expectedUser = Deno.env.get("HDFC_WEBHOOK_USERNAME") || "";
    const expectedPass = Deno.env.get("HDFC_WEBHOOK_PASSWORD") || "";

    if (expectedUser && expectedPass) {
      const authHeader = req.headers.get("Authorization") || "";
      if (authHeader.startsWith("Basic ")) {
        const decoded = atob(authHeader.replace("Basic ", ""));
        const [u, p] = decoded.split(":");
        if (u !== expectedUser || p !== expectedPass) {
          console.warn("Webhook auth failed");
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
      }
      // If no auth header, still accept (HDFC may not always send auth)
    }

    const body = await req.text();
    let data: Record<string, any>;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      data = Object.fromEntries(new URLSearchParams(body).entries());
    } else {
      try {
        data = JSON.parse(body);
      } catch {
        console.error("Could not parse webhook body:", body);
        return jsonResponse({ status: "ok" });
      }
    }

    console.log("HDFC webhook event:", JSON.stringify(data));

    const eventName = data.event_name || data.event || "";
    const content = data.content || data;
    const order = content.order || content;
    const orderId = order.order_id || data.order_id || "";
    const txnId = order.txn_id || data.txn_id || "";
    const hdfcStatus = (order.status || data.status || "").toUpperCase();
    const amount = Number(order.amount || data.amount || 0);

    if (!orderId) {
      console.warn("Webhook missing order_id");
      return jsonResponse({ status: "ok" });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Audit log webhook event
    try {
      await adminClient.from("payment_logs").insert({
        order_id: orderId,
        log_type: "webhook",
        request_payload: data as any,
        response_payload: { event_name: eventName, hdfc_status: hdfcStatus, amount } as any,
      });
    } catch (e) {
      console.error("payment_logs (webhook) insert failed:", e);
    }

    // Find payment
    const { data: payment } = await adminClient
      .from("payments")
      .select("*")
      .eq("transaction_id", orderId)
      .single();

    if (!payment) {
      console.warn("No payment found for order:", orderId);
      return jsonResponse({ status: "ok" });
    }

    // Determine new status
    const isSuccess = ["CHARGED", "TXN_CHARGED", "ORDER_SUCCEEDED"].includes(
      hdfcStatus
    ) || ["ORDER_SUCCEEDED", "TXN_CHARGED"].includes(eventName);

    const isFailed = ["AUTHORIZATION_FAILED", "JUSPAY_DECLINED", "TXN_FAILED", "ORDER_FAILED"].includes(
      hdfcStatus
    ) || ["ORDER_FAILED", "TXN_FAILED"].includes(eventName);

    const isRefund = ["REFUND_INITIATED", "REFUND_SUCCEEDED", "AUTO_REFUND_SUCCEEDED"].includes(eventName);

    if (isSuccess && payment.status === "pending") {
      // Update payment to completed
      await adminClient
        .from("payments")
        .update({
          status: "completed",
          transaction_reference: txnId,
          gateway_response: data,
          paid_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // Keep payment_transactions in sync
      await adminClient
        .from("payment_transactions")
        .update({ status: "SUCCESS", hdfc_txn_id: txnId })
        .eq("order_id", orderId);

      // Idempotent invoice reconciliation (recompute from completed payments)
      await reconcileInvoice(adminClient, payment.invoice_id);

      const { data: invoice } = await adminClient
        .from("invoices").select("*").eq("id", payment.invoice_id).single();
      if (invoice) {
        await createAccountingEntries(adminClient, payment, invoice, orderId, txnId);
        await notifyStudent(adminClient, payment, invoice, "success");
      }
    } else if (isFailed && payment.status === "pending") {
      await adminClient
        .from("payments")
        .update({ status: "failed", gateway_response: data })
        .eq("id", payment.id);

      await adminClient
        .from("payment_transactions")
        .update({ status: "FAILED", hdfc_txn_id: txnId })
        .eq("order_id", orderId);

      const { data: invoice } = await adminClient
        .from("invoices")
        .select("invoice_number")
        .eq("id", payment.invoice_id)
        .single();

      if (invoice) await notifyStudent(adminClient, payment, invoice, "failed");
    } else if (isRefund) {
      const refundAmount = Number(content.refund?.amount || order.amount_refunded || 0);
      if (refundAmount > 0) {
        // Insert refund record
        await adminClient.from("refunds").insert({
          invoice_id: payment.invoice_id,
          student_id: payment.student_id,
          property_id: payment.property_id,
          amount: refundAmount,
          reason: `HDFC Refund - ${eventName}`,
          refund_method: "online",
          status: eventName === "REFUND_SUCCEEDED" ? "processed" : "pending",
        });
      }
    }

    return jsonResponse({ status: "ok" });
  } catch (err) {
    console.error("hdfc-webhook error:", err);
    return jsonResponse({ status: "ok" }); // Always 200
  }
});

async function createAccountingEntries(
  client: any, payment: any, invoice: any, orderId: string, txnId: string
) {
  const propertyId = payment.property_id;
  if (!propertyId) return;

  let { data: bankAccount } = await client
    .from("accounts").select("id")
    .eq("property_id", propertyId).eq("name", "Bank Account").single();

  if (!bankAccount) {
    const { data: c } = await client.from("accounts").insert({
      property_id: propertyId, name: "Bank Account", account_type: "asset",
      code: "BANK-001", description: "Primary bank account",
    }).select("id").single();
    bankAccount = c;
  }

  let { data: feeAccount } = await client
    .from("accounts").select("id")
    .eq("property_id", propertyId).eq("name", "Fee Income").single();

  if (!feeAccount) {
    const { data: c } = await client.from("accounts").insert({
      property_id: propertyId, name: "Fee Income", account_type: "income",
      code: "FEE-001", description: "Student fee income",
    }).select("id").single();
    feeAccount = c;
  }

  if (!bankAccount || !feeAccount) return;

  await client.from("transactions").insert({
    property_id: propertyId, account_id: bankAccount.id,
    amount: payment.amount, transaction_type: "income",
    category: "fee_collection",
    description: `Online payment - ${invoice.invoice_number} (Order: ${orderId})`,
    payment_mode: "online", reference_number: txnId,
    date: new Date().toISOString().split("T")[0],
  });

  await client.from("journal_entries").insert({
    property_id: propertyId, entry_number: `JE-${Date.now()}`,
    description: `Online payment - ${invoice.invoice_number}`,
    debit_account_id: bankAccount.id, credit_account_id: feeAccount.id,
    amount: payment.amount, reference: `HDFC-${orderId}`,
    date: new Date().toISOString().split("T")[0],
  });
}

async function notifyStudent(client: any, payment: any, invoice: any, type: "success" | "failed") {
  if (!payment.student_id) return;
  const { data: student } = await client
    .from("students").select("user_id").eq("id", payment.student_id).single();
  if (!student) return;

  const title = type === "success" ? "Payment Successful" : "Payment Failed";
  const message = type === "success"
    ? `Your payment of ₹${payment.amount.toLocaleString("en-IN")} for invoice ${invoice.invoice_number} has been received.`
    : `Your payment of ₹${payment.amount.toLocaleString("en-IN")} could not be processed. Please try again.`;

  await client.from("notifications").insert({
    user_id: student.user_id, title, message, type: "billing", link: "/student/invoices",
  });
}

// Delegate to the DB function so reconciliation is identical across every code path.
async function reconcileInvoice(client: any, invoiceId: string) {
  if (!invoiceId) return;
  const { error } = await client.rpc("reconcile_invoice", { _invoice_id: invoiceId });
  if (error) console.error("reconcile_invoice rpc failed:", error);
}
