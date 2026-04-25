import { supabase } from "@/integrations/supabase/client";

type PaymentSessionResponse = {
  order_id: string;
  payment_url: string | null;
  payment_links: Record<string, string> | null;
  status: string;
  sdk_payload: Record<string, unknown> | null;
  amount?: number;
};

// Server computes the amount from the invoice — no client-supplied amount.
export async function createPaymentSession(invoiceId: string, returnUrl: string) {
  const { data, error } = await supabase.functions.invoke("hdfc-create-session", {
    body: { invoice_id: invoiceId, return_url: returnUrl },
  });
  if (error) throw error;
  return data as PaymentSessionResponse;
}

export function openPaymentCheckout(
  session: Pick<PaymentSessionResponse, "order_id" | "payment_url" | "payment_links">,
  pendingWindow?: Window | null
) {
  const checkoutUrl =
    session.payment_url ||
    session.payment_links?.web ||
    (session.order_id
      ? new URL(`/payment/callback?order_id=${session.order_id}`, window.location.origin).toString()
      : null);

  if (!checkoutUrl) {
    throw new Error("No payment URL received from gateway");
  }

  if (pendingWindow && !pendingWindow.closed) {
    pendingWindow.location.replace(checkoutUrl);
    return;
  }

  if (window.self !== window.top && window.top) {
    try {
      window.top.location.href = checkoutUrl;
      return;
    } catch {
      const popup = window.open(checkoutUrl, "_blank");
      if (popup) return;
    }
  }

  window.location.href = checkoutUrl;
}

export async function getOrderStatus(orderId: string) {
  const { data, error } = await supabase.functions.invoke("hdfc-order-status", {
    body: { order_id: orderId },
  });
  if (error) throw error;
  return data as {
    order_id: string;
    status: "SUCCESS" | "PENDING" | "FAILED" | "UNKNOWN" | "TAMPERED";
    hdfc_status: string;
    amount: number;
    currency?: string;
    txn_id: string | null;
    txn_uuid?: string | null;
    payment_method: string | null;
    payment_method_type: string | null;
    refunded: boolean;
    amount_refunded: number;
    gateway?: string | null;
    gateway_id?: number | null;
    gateway_reference_id?: string | null;
    payment_gateway_response?: {
      resp_code?: string | null;
      resp_message?: string | null;
      rrn?: string | null;
      epg_txn_id?: string | null;
      auth_id_code?: string | null;
    } | null;
    card?: {
      card_brand?: string | null;
      card_type?: string | null;
      card_issuer?: string | null;
      last_four_digits?: string | null;
    } | null;
    payer_vpa?: string | null;
    refunds?: Array<{
      id: string | null;
      unique_request_id?: string | null;
      amount: number;
      status: string | null;
      ref?: string | null;
      created?: string | null;
      refund_type?: string | null;
      refund_source?: string | null;
    }>;
    gateway_response: Record<string, unknown>;
  };
}

// Server-trusted verification for the success/failure pages.
export async function verifyPayment(orderId: string) {
  const { data, error } = await supabase.functions.invoke("hdfc-verify-payment", {
    body: { order_id: orderId },
  });
  if (error) throw error;
  return data as {
    status: "INITIATED" | "PENDING" | "SUCCESS" | "FAILED" | "TAMPERED" | "NOT_FOUND";
    order_id: string;
    amount: number | null;
    currency: string;
    hdfc_txn_id: string | null;
    payment_method: string | null;
    invoice_number: string | null;
  };
}

export async function initiateRefund(
  orderId: string,
  amount: number,
  uniqueRequestId?: string,
  reason?: string
) {
  const { data, error } = await supabase.functions.invoke("hdfc-refund", {
    body: { order_id: orderId, amount, unique_request_id: uniqueRequestId, reason },
  });
  if (error) throw error;
  return data as {
    status: "SUCCESS" | "PENDING" | "FAILURE" | "MANUAL_REVIEW";
    refund_id: string;
    unique_request_id: string;
    amount: number;
    refund_type: string | null;
    refund_source: string | null;
    gateway_response: Record<string, unknown>;
  };
}
