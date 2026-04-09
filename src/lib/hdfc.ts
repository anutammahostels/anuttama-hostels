import { supabase } from "@/integrations/supabase/client";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

export async function createPaymentSession(invoiceId: string, amount: number, returnUrl: string) {
  const { data, error } = await supabase.functions.invoke("hdfc-create-session", {
    body: { invoice_id: invoiceId, amount, return_url: returnUrl },
  });
  if (error) throw error;
  return data as {
    order_id: string;
    payment_url: string | null;
    payment_links: Record<string, string> | null;
    status: string;
    sdk_payload: Record<string, unknown> | null;
  };
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
