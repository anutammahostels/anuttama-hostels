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

    const basicAuth = btoa(API_KEY + ":");

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

    const hdfcStatus = (data.status || "").toUpperCase();
    let mappedStatus = "UNKNOWN";
    if (["CHARGED", "AUTO_REFUNDED"].includes(hdfcStatus)) mappedStatus = "SUCCESS";
    else if (["NEW", "PENDING_VBV", "AUTHORIZING", "COD_INITIATED", "STARTED", "AUTHENTICATION_FAILED"].includes(hdfcStatus)) mappedStatus = "PENDING";
    else if (["AUTHORIZATION_FAILED", "JUSPAY_DECLINED", "NOT_FOUND", "VOIDED"].includes(hdfcStatus)) mappedStatus = "FAILED";

    // --- Sync payment & invoice in DB when status is conclusive ---
    if (mappedStatus === "SUCCESS" || mappedStatus === "FAILED") {
      try {
        const adminClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { data: payment } = await adminClient
          .from("payments")
          .select("*")
          .eq("transaction_id", order_id)
          .single();

        if (payment && payment.status === "pending") {
          const txnId = data.txn_id || null;

          if (mappedStatus === "SUCCESS") {
            // Update payment to completed
            await adminClient.from("payments").update({
              status: "completed",
              transaction_reference: txnId,
              gateway_response: data,
              paid_at: new Date().toISOString(),
              payment_label: "Online Payment",
              payment_mode_label: data.payment_method_type || data.payment_method || "online",
            }).eq("id", payment.id);

            // Update invoice
            const { data: invoice } = await adminClient
              .from("invoices")
              .select("*")
              .eq("id", payment.invoice_id)
              .single();

            if (invoice) {
              const newPaidAmount = (invoice.paid_amount || 0) + payment.amount;
              const newStatus = newPaidAmount >= invoice.total_amount ? "paid" : "partial";

              await adminClient.from("invoices").update({
                paid_amount: newPaidAmount,
                status: newStatus,
                payment_date: new Date().toISOString(),
                payment_method: "online",
              }).eq("id", invoice.id);

              // Create accounting entries
              await createAccountingEntries(adminClient, payment, invoice, order_id, txnId);

              // Notify student
              await notifyStudent(adminClient, payment, invoice, "success");
            }
          } else {
            // FAILED
            await adminClient.from("payments").update({
              status: "failed",
              gateway_response: data,
            }).eq("id", payment.id);

            const { data: invoice } = await adminClient
              .from("invoices")
              .select("invoice_number")
              .eq("id", payment.invoice_id)
              .single();

            if (invoice) await notifyStudent(adminClient, payment, invoice, "failed");
          }
        }
      } catch (syncErr) {
        console.error("Error syncing payment status:", syncErr);
        // Don't fail the response — still return the status to the client
      }
    }

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

async function createAccountingEntries(
  client: any, payment: any, invoice: any, orderId: string, txnId: string | null
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
    payment_mode: "online", reference_number: txnId || orderId,
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
    ? `Your payment of ₹${payment.amount} for invoice ${invoice.invoice_number} has been received.`
    : `Your payment of ₹${payment.amount} could not be processed. Please try again.`;

  await client.from("notifications").insert({
    user_id: student.user_id, title, message, type: "billing", link: "/student/invoices",
  });
}
