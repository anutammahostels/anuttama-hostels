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

// HDFC SmartGateway status buckets (per docs/transaction-status)
const SUCCESS_STATUSES = new Set([
  "CHARGED",
  "AUTO_REFUNDED",
  "COD_INITIATED",
  "PARTIAL_CHARGED",
]);
const PENDING_STATUSES = new Set([
  "NEW",
  "PENDING",
  "PENDING_VBV",
  "AUTHORIZING",
  "AUTHORIZED",
  "CAPTURE_INITIATED",
  "VOID_INITIATED",
  "STARTED",
]);
const FAILED_STATUSES = new Set([
  "AUTHENTICATION_FAILED",
  "AUTHORIZATION_FAILED",
  "JUSPAY_DECLINED",
  "CAPTURE_FAILED",
  "VOID_FAILED",
  "VOIDED",
  "NOT_FOUND",
  "DECLINED",
  "EXPIRED",
]);

function mapStatus(hdfcStatus: string): "SUCCESS" | "PENDING" | "FAILED" | "UNKNOWN" {
  if (SUCCESS_STATUSES.has(hdfcStatus)) return "SUCCESS";
  if (PENDING_STATUSES.has(hdfcStatus)) return "PENDING";
  if (FAILED_STATUSES.has(hdfcStatus)) return "FAILED";
  return "UNKNOWN";
}

// Normalize HDFC Order Status API response to the documented spec shape.
function normalizeOrderStatus(data: Record<string, any>, fallbackOrderId: string) {
  const hdfcStatus = String(data.status || "").toUpperCase();
  const mappedStatus = mapStatus(hdfcStatus);

  const card = data.card
    ? {
        card_brand: data.card.card_brand ?? null,
        card_type: data.card.card_type ?? null,
        card_issuer: data.card.card_issuer ?? null,
        last_four_digits: data.card.last_four_digits ?? null,
        card_isin: data.card.card_isin ?? null,
        expiry_month: data.card.expiry_month ?? null,
        expiry_year: data.card.expiry_year ?? null,
        name_on_card: data.card.name_on_card ?? null,
        using_saved_card: data.card.using_saved_card ?? null,
        card_fingerprint: data.card.card_fingerprint ?? null,
        card_reference: data.card.card_reference ?? null,
      }
    : null;

  const pgr = data.payment_gateway_response
    ? {
        resp_code: data.payment_gateway_response.resp_code ?? null,
        resp_message: data.payment_gateway_response.resp_message ?? null,
        rrn: data.payment_gateway_response.rrn ?? null,
        epg_txn_id: data.payment_gateway_response.epg_txn_id ?? null,
        auth_id_code: data.payment_gateway_response.auth_id_code ?? null,
        txn_id: data.payment_gateway_response.txn_id ?? null,
        created: data.payment_gateway_response.created ?? null,
      }
    : null;

  const txnDetail = data.txn_detail
    ? {
        txn_id: data.txn_detail.txn_id ?? null,
        txn_uuid: data.txn_detail.txn_uuid ?? null,
        order_id: data.txn_detail.order_id ?? null,
        status: data.txn_detail.status ?? null,
        gateway: data.txn_detail.gateway ?? null,
        gateway_id: data.txn_detail.gateway_id ?? null,
        net_amount: data.txn_detail.net_amount ?? null,
        txn_amount: data.txn_detail.txn_amount ?? null,
        tax_amount: data.txn_detail.tax_amount ?? null,
        surcharge_amount: data.txn_detail.surcharge_amount ?? null,
        currency: data.txn_detail.currency ?? null,
        express_checkout: data.txn_detail.express_checkout ?? null,
        redirect: data.txn_detail.redirect ?? null,
        error_code: data.txn_detail.error_code ?? null,
        error_message: data.txn_detail.error_message ?? null,
        created: data.txn_detail.created ?? null,
      }
    : null;

  const upi = data.upi
    ? {
        payer_vpa: data.upi.payer_vpa ?? null,
        txn_flow_type: data.upi.txn_flow_type ?? null,
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
        sent_to_gateway: r.sent_to_gateway ?? null,
        initiated_by: r.initiated_by ?? null,
        error_code: r.error_code ?? null,
        error_message: r.error_message ?? null,
      }))
    : [];

  return {
    order_id: data.order_id || fallbackOrderId,
    id: data.id ?? null,
    status: mappedStatus,
    hdfc_status: hdfcStatus,
    status_id: data.status_id ?? null,
    amount: Number(data.amount ?? 0),
    currency: data.currency || "INR",
    customer_id: data.customer_id ?? null,
    customer_email: data.customer_email ?? null,
    customer_phone: data.customer_phone ?? null,
    merchant_id: data.merchant_id ?? null,
    date_created: data.date_created ?? null,
    return_url: data.return_url ?? null,
    product_id: data.product_id ?? null,
    txn_id: data.txn_id ?? null,
    txn_uuid: data.txn_uuid ?? null,
    payment_method: data.payment_method ?? null,
    payment_method_type: data.payment_method_type ?? null,
    auth_type: data.auth_type ?? null,
    refunded: Boolean(data.refunded),
    amount_refunded: Number(data.amount_refunded ?? 0),
    effective_amount: data.effective_amount ?? null,
    gateway_id: data.gateway_id ?? null,
    gateway_reference_id: data.gateway_reference_id ?? null,
    gateway: data.txn_detail?.gateway ?? null,
    payer_vpa: data.payer_vpa ?? data.upi?.payer_vpa ?? null,
    bank_error_code: data.bank_error_code ?? null,
    bank_error_message: data.bank_error_message ?? null,
    resp_code: data.resp_code ?? null,
    resp_message: data.resp_message ?? null,
    card,
    upi,
    txn_detail: txnDetail,
    payment_gateway_response: pgr,
    refunds,
  };
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
        ? Deno.env.get("HDFC_BASE_URL_PRODUCTION") || "https://smartgateway.hdfc.bank.in"
        : Deno.env.get("HDFC_BASE_URL_SANDBOX") || "https://smartgateway.hdfcuat.bank.in";

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

    // Per HDFC docs: Authorization is Base64(API_KEY) only — no colon suffix.
    const basicAuth = btoa(API_KEY);
    const RESELLER_ID = Deno.env.get("HDFC_RESELLER_ID") || "hdfc_reseller";

    const customerId =
      (existingTxn?.customer_id as string | undefined) || `${MERCHANT_ID}_anon`;

    const requestUrl = `${BASE_URL}/orders/${order_id}`;
    const requestMeta = {
      method: "GET",
      url: requestUrl,
      headers: {
        "x-merchantid": MERCHANT_ID,
        "x-customerid": customerId,
        "x-resellerid": RESELLER_ID,
        version: "2023-06-30",
        "Content-Type": "application/json",
      },
    };

    const res = await fetch(requestUrl, {
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

    // Non-2xx: surface as PENDING when we have a local txn so the UI doesn't
    // panic on rate-limit / transient errors.
    if (!res.ok) {
      const errBody = await res.text();
      console.error("HDFC order status non-2xx:", res.status, errBody);
      await logPayment(adminClient, order_id, "status_api", requestMeta, {
        http_status: res.status,
        raw: errBody,
      });

      if (existingTxn) {
        const fallbackStatus =
          existingTxn.status === "SUCCESS" ? "SUCCESS" :
          existingTxn.status === "FAILED" ? "FAILED" :
          existingTxn.status === "TAMPERED" ? "TAMPERED" :
          "PENDING";
        return jsonResponse({
          order_id,
          status: fallbackStatus,
          hdfc_status: fallbackStatus,
          amount: Number(existingTxn.amount),
          txn_id: existingTxn.hdfc_txn_id,
          payment_method: existingTxn.payment_method,
          payment_method_type: existingTxn.payment_method,
          refunded: false,
          amount_refunded: 0,
          gateway_response: { transient: true, http_status: res.status },
        });
      }

      return jsonResponse(
        {
          error: "Gateway returned an error",
          http_status: res.status,
          gateway_error: (() => { try { return JSON.parse(errBody); } catch { return errBody; } })(),
        },
        502
      );
    }

    const body = await res.text();
    console.log("HDFC order status response:", res.status, body);

    let data: Record<string, any>;
    try {
      data = JSON.parse(body);
    } catch {
      await logPayment(adminClient, order_id, "status_api", requestMeta, {
        http_status: res.status,
        raw: body,
        parse_error: true,
      });
      return jsonResponse({ error: "Invalid response from gateway", raw: body }, 502);
    }

    const normalized = normalizeOrderStatus(data, order_id);
    const mappedStatus = normalized.status;
    const hdfcStatus = normalized.hdfc_status;

    // Compact log entry: documented fields only, no secrets, no SDK payloads.
    await logPayment(adminClient, order_id, "status_api", requestMeta, {
      http_status: res.status,
      raw_status: hdfcStatus,
      raw_status_id: normalized.status_id,
      parsed: normalized,
    });

    // --- TAMPER CHECK ---
    if (mappedStatus === "SUCCESS" && existingTxn) {
      const hdfcOrderId = String(normalized.order_id || "").trim();
      const hdfcAmount = Number(normalized.amount || 0);
      const storedAmount = Number(existingTxn.amount);

      const orderMatch = hdfcOrderId === order_id;
      const amountMatch = Math.abs(hdfcAmount - storedAmount) < 0.01;

      if (!orderMatch || !amountMatch) {
        console.error("TAMPER DETECTED", { order_id, hdfcOrderId, hdfcAmount, storedAmount });
        await adminClient
          .from("payment_transactions")
          .update({
            status: "TAMPERED",
            hdfc_txn_id: normalized.txn_id || null,
          })
          .eq("order_id", order_id);
        await logPayment(adminClient, order_id, "status_api", { tamper_check: true }, { hdfcOrderId, hdfcAmount, storedAmount });

        return jsonResponse({
          ...normalized,
          status: "TAMPERED",
          amount: storedAmount,
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
          const txnId = normalized.txn_id;

          if (mappedStatus === "SUCCESS") {
            await adminClient.from("payments").update({
              status: "completed",
              transaction_reference: txnId,
              gateway_response: data,
              paid_at: new Date().toISOString(),
              payment_label: "Online Payment",
              payment_mode_label: normalized.payment_method_type || normalized.payment_method || "online",
            }).eq("id", payment.id);

            await adminClient.from("payment_transactions").update({
              status: "SUCCESS",
              hdfc_txn_id: txnId,
              payment_method: normalized.payment_method_type || normalized.payment_method || null,
            }).eq("order_id", order_id);

            await reconcileInvoice(adminClient, payment.invoice_id);

            const { data: invoice } = await adminClient
              .from("invoices").select("*").eq("id", payment.invoice_id).single();
            if (invoice) {
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
          await adminClient.from("payment_transactions").update({
            status: mappedStatus === "SUCCESS" ? "SUCCESS" : "FAILED",
            hdfc_txn_id: normalized.txn_id || null,
            payment_method: normalized.payment_method_type || normalized.payment_method || null,
          }).eq("order_id", order_id);

          if (mappedStatus === "SUCCESS" && existingTxn.invoice_id) {
            await reconcileInvoice(adminClient, existingTxn.invoice_id);
          }
        }
      } catch (syncErr) {
        console.error("Error syncing payment status:", syncErr);
      }
    } else if (mappedStatus === "PENDING" && existingTxn && existingTxn.status === "INITIATED") {
      await adminClient.from("payment_transactions").update({ status: "PENDING" }).eq("order_id", order_id);
    }

    return jsonResponse({
      ...normalized,
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

async function reconcileInvoice(client: any, invoiceId: string) {
  if (!invoiceId) return;

  const { data: invoice } = await client
    .from("invoices")
    .select("id, total_amount, paid_amount, status")
    .eq("id", invoiceId)
    .single();
  if (!invoice) return;

  const { data: completed } = await client
    .from("payments")
    .select("amount")
    .eq("invoice_id", invoiceId)
    .eq("status", "completed");

  const computedPaid = (completed || []).reduce(
    (s: number, p: any) => s + Number(p.amount || 0),
    0
  );

  const total = Number(invoice.total_amount || 0);
  const newStatus =
    computedPaid >= total && total > 0 ? "paid" :
    computedPaid > 0 ? "partial" :
    "pending";

  await client.from("invoices").update({
    paid_amount: computedPaid,
    status: newStatus,
    payment_date: computedPaid > 0 ? new Date().toISOString() : null,
    payment_method: computedPaid > 0 ? "online" : null,
  }).eq("id", invoiceId);
}
