import { supabase } from "@/integrations/supabase/client";

type PaymentSessionResponse = {
  order_id: string;
  payment_url: string | null;
  payment_links: Record<string, string> | null;
  status: string;
  sdk_payload: Record<string, unknown> | null;
};

export async function createPaymentSession(invoiceId: string, amount: number, returnUrl: string) {
  const { data, error } = await supabase.functions.invoke("hdfc-create-session", {
    body: { invoice_id: invoiceId, amount, return_url: returnUrl },
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
    status: "SUCCESS" | "PENDING" | "FAILED" | "UNKNOWN";
    hdfc_status: string;
    amount: number;
    txn_id: string | null;
    payment_method: string | null;
    payment_method_type: string | null;
    refunded: boolean;
    amount_refunded: number;
    gateway_response: Record<string, unknown>;
  };
}

export async function initiateRefund(orderId: string, amount: number, uniqueRequestId?: string) {
  const { data, error } = await supabase.functions.invoke("hdfc-refund", {
    body: { order_id: orderId, amount, unique_request_id: uniqueRequestId },
  });
  if (error) throw error;
  return data;
}

export function generateOrderId(invoiceNumber: string): string {
  return `HSTY_${Date.now()}_${invoiceNumber.replace(/[^a-zA-Z0-9]/g, "")}`;
}
