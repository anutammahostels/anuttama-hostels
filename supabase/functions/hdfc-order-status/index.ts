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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { order_id } = await req.json();
    if (!order_id) return jsonResponse({ error: "order_id required" }, 400);

    const API_KEY = Deno.env.get("HDFC_API_KEY")!;
    const MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
    const ENVIRONMENT = Deno.env.get("HDFC_ENVIRONMENT") || "sandbox";
    const BASE_URL =
      ENVIRONMENT === "production"
        ? Deno.env.get("HDFC_BASE_URL_PRODUCTION") || "https://smartgateway.hdfcbank.com"
        : Deno.env.get("HDFC_BASE_URL_SANDBOX") || "https://smartgatewayuat.hdfcbank.com";

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency: if already SUCCESS in payment_transactions, short-circuit (replay-safe)
    const { data: existingTxn } = await adminClient
      .from("payment_transactions")
      .select("*")
      .eq("order_id", order_id)
      .maybeSingle();

    if (existingTxn && existingTxn.status === "SUCCESS") {
      return jsonResponse({
        order_id,
        status: "SUCCESS",
        hdfc_status: "CHARGED",
        amount: Number(existingTxn.amount),
        txn_id: existingTxn.hdfc_txn_id,
        payment_method: existingTxn.payment_method,
        payment_method_type: existingTxn.payment_method,
        refunded: false,
        amount_refunded: 0,
        gateway_response: { idempotent: true },
      });
    }

    if (existingTxn && existingTxn.status === "TAMPERED") {
      return jsonResponse({
        order_id,
        status: "TAMPERED",
        hdfc_status: "TAMPERED",
        amount: Number(existingTxn.amount),
        txn_id: existingTxn.hdfc_txn_id,
        payment_method: null,
        payment_method_type: null,
        refunded: false,
        amount_refunded: 0,
        gateway_response: { tampered: true },
      });
    }

    const basicAuth = btoa(API_KEY + ":");
    const RESELLER_ID = Deno.env.get("HDFC_RESELLER_ID") || "hdfc_reseller";

    // Customer ID must match what was sent at session creation.
    // Stored on payment_transactions; fall back to a deterministic anonymous id.
    const customerId =
      (existingTxn?.customer_id as string | undefined) || `${MERCHANT_ID}_anon`;

    const res = await fetch(`${BASE_URL}/orders/${order_id}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        version: "2023-06-30",
        "x-merchantid": MERCHANT_ID,
        "x-customerid": customerId,
        "x-resellerid": RESELLER_ID,
      },
    });

    // Per spec: 400 / 401 / 500 are explicit error envelopes
    if (res.status === 401 || res.status === 400 || res.status >= 500) {
      const errBody = await res.text();
      console.error("HDFC order status non-2xx:", res.status, errBody);
      await logPayment(adminClient, order_id, "status_api", { order_id, customer_id: customerId }, { http: res.status, raw: errBody });
      return jsonResponse(
        {
          error: "Gateway returned an error",
          http_status: res.status,
          gateway_error: (() => { try { return JSON.parse(errBody); } catch { return errBody; } })(),
        },
        res.status === 401 ? 502 : 502
      );
    }

    const body = await res.text();
    console.log("HDFC order status response:", res.status, body);

    let data: Record<string, any>;
    try {
      data = JSON.parse(body);
    } catch {
      await logPayment(adminClient, order_id, "status_api", { order_id }, { http: res.status, raw: body });
      return jsonResponse({ error: "Invalid response from gateway", raw: body }, 502);
    }

    // Always log status_api response
    await logPayment(adminClient, order_id, "status_api", { order_id }, { http: res.status, body: data });

    const hdfcStatus = (data.status || "").toUpperCase();
    let mappedStatus = "UNKNOWN";
    if (["CHARGED", "AUTO_REFUNDED"].includes(hdfcStatus)) mappedStatus = "SUCCESS";
    else if (["NEW", "PENDING_VBV", "AUTHORIZING", "COD_INITIATED", "STARTED", "AUTHENTICATION_FAILED"].includes(hdfcStatus)) mappedStatus = "PENDING";
    else if (["AUTHORIZATION_FAILED", "JUSPAY_DECLINED", "NOT_FOUND", "VOIDED"].includes(hdfcStatus)) mappedStatus = "FAILED";

    // --- TAMPER CHECK: compare HDFC response vs stored payment_transactions ---
    if (mappedStatus === "SUCCESS" && existingTxn) {
      const hdfcOrderId = String(data.order_id || "").trim();
      const hdfcAmount = Number(data.amount || 0);
      const storedAmount = Number(existingTxn.amount);

      const orderMatch = hdfcOrderId === order_id;
      const amountMatch = Math.abs(hdfcAmount - storedAmount) < 0.01;

      if (!orderMatch || !amountMatch) {
        console.error("TAMPER DETECTED", { order_id, hdfcOrderId, hdfcAmount, storedAmount });
        await adminClient
          .from("payment_transactions")
          .update({
            status: "TAMPERED",
            hdfc_txn_id: data.txn_id || null,
          })
          .eq("order_id", order_id);
        await logPayment(adminClient, order_id, "status_api", { tamper_check: true }, { hdfcOrderId, hdfcAmount, storedAmount });

        return jsonResponse({
          order_id,
          status: "TAMPERED",
          hdfc_status: hdfcStatus,
          amount: storedAmount,
          txn_id: data.txn_id || null,
          payment_method: data.payment_method || null,
          payment_method_type: data.payment_method_type || null,
          refunded: false,
          amount_refunded: 0,
          gateway_response: data,
        });
      }
    }

    // --- Sync payment & invoice in DB when status is conclusive ---
    if (mappedStatus === "SUCCESS" || mappedStatus === "FAILED") {
      try {
        const { data: payment } = await adminClient
          .from("payments")
          .select("*")
          .eq("transaction_id", order_id)
          .single();

        if (payment && payment.status === "pending") {
          const txnId = data.txn_id || null;

          if (mappedStatus === "SUCCESS") {
            await adminClient.from("payments").update({
              status: "completed",
              transaction_reference: txnId,
              gateway_response: data,
              paid_at: new Date().toISOString(),
              payment_label: "Online Payment",
              payment_mode_label: data.payment_method_type || data.payment_method || "online",
            }).eq("id", payment.id);

            // Update payment_transactions to SUCCESS (verified)
            await adminClient.from("payment_transactions").update({
              status: "SUCCESS",
              hdfc_txn_id: txnId,
              payment_method: data.payment_method_type || data.payment_method || null,
            }).eq("order_id", order_id);

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

              await createAccountingEntries(adminClient, payment, invoice, order_id, txnId);
              await notifyStudent(adminClient, payment, invoice, "success");
            }
          } else {
            await adminClient.from("payments").update({
              status: "failed",
              gateway_response: data,
            }).eq("id", payment.id);

            await adminClient.from("payment_transactions").update({
              status: "FAILED",
              hdfc_txn_id: txnId,
            }).eq("order_id", order_id);

            const { data: invoice } = await adminClient
              .from("invoices")
              .select("invoice_number")
              .eq("id", payment.invoice_id)
              .single();

            if (invoice) await notifyStudent(adminClient, payment, invoice, "failed");
          }
        } else if (existingTxn && existingTxn.status !== "SUCCESS") {
          // payment_transactions exists but no payments row in pending state — still update txn status
          await adminClient.from("payment_transactions").update({
            status: mappedStatus === "SUCCESS" ? "SUCCESS" : "FAILED",
            hdfc_txn_id: data.txn_id || null,
            payment_method: data.payment_method_type || data.payment_method || null,
          }).eq("order_id", order_id);
        }
      } catch (syncErr) {
        console.error("Error syncing payment status:", syncErr);
      }
    } else if (mappedStatus === "PENDING" && existingTxn && existingTxn.status === "INITIATED") {
      await adminClient.from("payment_transactions").update({ status: "PENDING" }).eq("order_id", order_id);
    }

    // Normalize the rich subset of the spec response
    const card = data.card
      ? {
          card_brand: data.card.card_brand || null,
          card_type: data.card.card_type || null,
          card_issuer: data.card.card_issuer || null,
          last_four_digits: data.card.last_four_digits || null,
        }
      : null;

    const pgr = data.payment_gateway_response
      ? {
          resp_code: data.payment_gateway_response.resp_code ?? null,
          resp_message: data.payment_gateway_response.resp_message ?? null,
          rrn: data.payment_gateway_response.rrn ?? null,
          epg_txn_id: data.payment_gateway_response.epg_txn_id ?? null,
          auth_id_code: data.payment_gateway_response.auth_id_code ?? null,
        }
      : null;

    const refunds = Array.isArray(data.refunds)
      ? data.refunds.map((r: any) => ({
          id: r.id ?? r.unique_request_id ?? null,
          unique_request_id: r.unique_request_id ?? null,
          amount: Number(r.amount ?? 0),
          status: r.status ?? null,
          ref: r.ref ?? null,
          created: r.created ?? null,
          refund_type: r.refund_type ?? null,
          refund_source: r.refund_source ?? null,
        }))
      : [];

    return jsonResponse({
      order_id: data.order_id || order_id,
      status: mappedStatus,
      hdfc_status: hdfcStatus,
      amount: data.amount,
      currency: data.currency || "INR",
      txn_id: data.txn_id || null,
      txn_uuid: data.txn_uuid || null,
      payment_method: data.payment_method || null,
      payment_method_type: data.payment_method_type || null,
      refunded: data.refunded || false,
      amount_refunded: data.amount_refunded || 0,
      gateway: data.txn_detail?.gateway || null,
      gateway_id: data.gateway_id ?? null,
      gateway_reference_id: data.gateway_reference_id ?? null,
      payment_gateway_response: pgr,
      card,
      payer_vpa: data.payer_vpa || data.upi?.payer_vpa || null,
      refunds,
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
