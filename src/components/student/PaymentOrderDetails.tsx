import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getOrderStatus } from "@/lib/hdfc";
import { buildReceiptHtml, invoiceToReceipt } from "@/lib/receiptTemplate";
import {
  Loader2,
  RefreshCw,
  CreditCard,
  Smartphone,
  Building2,
  ShieldCheck,
  Undo2,
  Hash,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { format } from "date-fns";

type Props = {
  invoiceId: string;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    SUCCESS: "bg-green-500/10 text-green-600 border-green-500/20",
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    INITIATED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
    TAMPERED: "bg-red-600/10 text-red-700 border-red-600/30",
  };
  return (
    <Badge variant="outline" className={map[status] || ""}>
      {status}
    </Badge>
  );
};

const methodIcon = (type?: string | null) => {
  switch ((type || "").toUpperCase()) {
    case "UPI":
      return <Smartphone className="h-4 w-4" />;
    case "NB":
      return <Building2 className="h-4 w-4" />;
    case "CARD":
      return <CreditCard className="h-4 w-4" />;
    default:
      return <Hash className="h-4 w-4" />;
  }
};

export function PaymentOrderDetails({ invoiceId }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Latest payment_transactions row for this invoice
  const { data: txn, isLoading: txnLoading } = useQuery({
    queryKey: ["latest-txn", invoiceId],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // All completed payments for this invoice (online + offline) — for receipts
  const { data: payments = [] } = useQuery({
    queryKey: ["invoice-payments", invoiceId],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .eq("status", "completed")
        .order("paid_at", { ascending: true });
      return data || [];
    },
  });

  // Live HDFC details (only when expanded and order exists)
  const {
    data: order,
    isFetching: orderFetching,
    refetch,
  } = useQuery({
    queryKey: ["order-status", txn?.order_id],
    queryFn: () => getOrderStatus(txn!.order_id),
    enabled: expanded && !!txn?.order_id,
    staleTime: 30_000,
  });

  const downloadPaymentReceipt = async (payment: any) => {
    // Fetch full invoice + student for the receipt
    const { data: inv } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
    if (!inv) return;
    const { data: stu } = await supabase
      .from("students")
      .select("id, roll_number, user_id, father_name, mother_name, gender, course")
      .eq("id", inv.student_id)
      .maybeSingle();
    const { data: prof } = stu?.user_id
      ? await supabase.from("profiles").select("full_name").eq("id", stu.user_id).single()
      : { data: null as any };

    // Override invoice fields so the receipt represents THIS payment
    const receiptInvoice = {
      ...inv,
      paid_amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || inv.payment_method || "cash",
      payment_date: payment.paid_at || inv.payment_date,
      invoice_number: `${inv.invoice_number} · RCPT-${String(payment.id).slice(0, 8).toUpperCase()}`,
    };

    const data = invoiceToReceipt(receiptInvoice, {
      studentName: prof?.full_name || "Student",
      rollNumber: stu?.roll_number || undefined,
      fatherName: stu?.father_name || undefined,
      motherName: stu?.mother_name || undefined,
      gender: stu?.gender || undefined,
      course: stu?.course || undefined,
    });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(buildReceiptHtml(data));
    w.document.close();
  };

  if (txnLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading payment details…
      </div>
    );
  }

  if (!txn && payments.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No payment activity yet for this invoice.
      </p>
    );
  }

  return (
    <div className="border-t border-border/50 pt-3 mt-3 space-y-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Payment Details
          </span>
          {statusBadge(txn.status)}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <Card className="bg-muted/30 border-border/40">
          <CardContent className="p-4 space-y-4">
            {/* Order summary (always available from DB) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Field label="Order ID" value={txn.order_id} mono />
              <Field
                label="Amount"
                value={`₹${Number(txn.amount).toLocaleString("en-IN")} ${txn.currency || "INR"}`}
              />
              <Field
                label="Initiated"
                value={format(new Date(txn.created_at), "dd MMM yyyy, HH:mm")}
              />
              <Field
                label="Last update"
                value={format(new Date(txn.updated_at), "dd MMM yyyy, HH:mm")}
              />
              {txn.hdfc_txn_id && (
                <Field label="HDFC Txn ID" value={txn.hdfc_txn_id} mono />
              )}
              {txn.payment_method && (
                <Field label="Method" value={txn.payment_method} />
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                Live data from HDFC SmartGateway
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => refetch()}
                disabled={orderFetching}
                className="h-7 text-xs"
              >
                {orderFetching ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh
              </Button>
            </div>

            {orderFetching && !order && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Fetching latest gateway response…
              </div>
            )}

            {order && (
              <>
                <Separator />

                {/* Gateway snapshot */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Field
                    label="Gateway Status"
                    value={order.hdfc_status || "—"}
                  />
                  <Field
                    label="Gateway"
                    value={order.gateway || "—"}
                  />
                  {order.txn_uuid && (
                    <Field label="Txn UUID" value={order.txn_uuid} mono />
                  )}
                  {order.gateway_reference_id && (
                    <Field
                      label="Gateway Ref"
                      value={order.gateway_reference_id}
                      mono
                    />
                  )}
                </div>

                {/* Method-specific block */}
                {(order.card || order.payer_vpa) && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        {methodIcon(order.payment_method_type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-medium text-foreground">
                          {order.payment_method_type || "Payment"}
                          {order.payment_method
                            ? ` · ${order.payment_method}`
                            : ""}
                        </p>
                        {order.card && (
                          <p className="text-xs text-muted-foreground">
                            {[
                              order.card.card_brand,
                              order.card.card_type,
                              order.card.card_issuer,
                              order.card.last_four_digits
                                ? `•••• ${order.card.last_four_digits}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        {order.payer_vpa && (
                          <p className="text-xs text-muted-foreground font-mono">
                            VPA: {order.payer_vpa}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* PG response */}
                {order.payment_gateway_response && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        Gateway Response
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {order.payment_gateway_response.resp_code && (
                          <Field
                            label="Resp Code"
                            value={order.payment_gateway_response.resp_code}
                          />
                        )}
                        {order.payment_gateway_response.resp_message && (
                          <Field
                            label="Resp Message"
                            value={order.payment_gateway_response.resp_message}
                          />
                        )}
                        {order.payment_gateway_response.rrn && (
                          <Field
                            label="RRN"
                            value={order.payment_gateway_response.rrn}
                            mono
                          />
                        )}
                        {order.payment_gateway_response.epg_txn_id && (
                          <Field
                            label="EPG Txn ID"
                            value={order.payment_gateway_response.epg_txn_id}
                            mono
                          />
                        )}
                        {order.payment_gateway_response.auth_id_code && (
                          <Field
                            label="Auth Code"
                            value={order.payment_gateway_response.auth_id_code}
                            mono
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Refunds */}
                {order.refunds && order.refunds.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Undo2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs font-medium text-foreground">
                          Refunds ({order.refunds.length}) · Total refunded ₹
                          {Number(order.amount_refunded || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {order.refunds.map((r, idx) => (
                          <div
                            key={r.id || r.unique_request_id || idx}
                            className="rounded-md border border-border/40 bg-background p-2 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">
                                ₹{Number(r.amount).toLocaleString("en-IN")}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  r.status === "SUCCESS"
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : r.status === "PENDING"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : "bg-red-500/10 text-red-600 border-red-500/20"
                                }
                              >
                                {r.status || "—"}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground space-y-0.5">
                              {r.ref && (
                                <p className="font-mono break-all">
                                  Ref: {r.ref}
                                </p>
                              )}
                              {r.refund_source && (
                                <p>Source: {r.refund_source}</p>
                              )}
                              {r.created && (
                                <p>
                                  {format(
                                    new Date(r.created),
                                    "dd MMM yyyy, HH:mm"
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-foreground break-all ${mono ? "font-mono text-[11px]" : "text-xs font-medium"}`}
      >
        {value}
      </p>
    </div>
  );
}
