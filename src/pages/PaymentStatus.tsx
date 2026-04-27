import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getOrderStatus, verifyPayment } from "@/lib/hdfc";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Clock, ShieldAlert } from "lucide-react";

type UiStatus =
  | "loading"
  | "completed"
  | "failed"
  | "not_found"
  | "processing"
  | "tampered";

type PaymentResult = {
  status: UiStatus;
  orderId: string;
  amount?: number | null;
  invoiceNumber?: string | null;
  transactionRef?: string | null;
  paymentMethodLabel?: string | null;
};

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const resolvedOrderId =
    searchParams.get("order_id") || sessionStorage.getItem("hdfc_pending_order_id") || "";

  const [result, setResult] = useState<PaymentResult>({
    status: "loading",
    orderId: resolvedOrderId,
  });

  useEffect(() => {
    const orderId = resolvedOrderId;
    if (!orderId) {
      setResult({ status: "not_found", orderId: "" });
      return;
    }

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Build a payment-method label from rich order-status detail.
    const buildMethodLabel = (detail: Awaited<ReturnType<typeof getOrderStatus>>) => {
      if (detail.card?.last_four_digits) {
        const brand = detail.card.card_brand || "Card";
        return `${brand} •••• ${detail.card.last_four_digits}`;
      }
      if (detail.payer_vpa) return `UPI: ${detail.payer_vpa}`;
      if (detail.payment_method_type) return detail.payment_method_type;
      if (detail.payment_method) return detail.payment_method;
      return null;
    };

    // Try to resolve a final UI status. Trusts hdfc-order-status (server-verified
    // + DB-synced) and falls back to hdfc-verify-payment for invoice metadata.
    const tryResolve = async (): Promise<boolean> => {
      let detail: Awaited<ReturnType<typeof getOrderStatus>> | null = null;
      try {
        detail = await getOrderStatus(orderId);
      } catch (err) {
        console.error("hdfc-order-status check failed:", err);
      }

      // verifyPayment is best-effort — it gives us the invoice number, but if
      // it fails (auth/network), we still proceed with the order-status result.
      let verified: Awaited<ReturnType<typeof verifyPayment>> | null = null;
      try {
        verified = await verifyPayment(orderId);
      } catch (err) {
        console.error("verifyPayment failed (non-fatal):", err);
      }

      const finalStatus = detail?.status || verified?.status || null;
      if (!finalStatus) return false;

      const amount =
        detail?.amount != null ? Number(detail.amount) : verified?.amount ?? null;
      const invoiceNumber = verified?.invoice_number ?? null;
      const transactionRef = detail?.txn_id ?? verified?.hdfc_txn_id ?? null;

      if (finalStatus === "SUCCESS") {
        sessionStorage.removeItem("hdfc_pending_order_id");
        setResult({
          status: "completed",
          orderId,
          amount,
          invoiceNumber,
          transactionRef,
          paymentMethodLabel: detail ? buildMethodLabel(detail) : null,
        });
        return true;
      }
      if (finalStatus === "FAILED") {
        sessionStorage.removeItem("hdfc_pending_order_id");
        setResult({ status: "failed", orderId, amount });
        return true;
      }
      if (finalStatus === "TAMPERED") {
        sessionStorage.removeItem("hdfc_pending_order_id");
        setResult({ status: "tampered", orderId, amount });
        return true;
      }
      // PENDING / INITIATED / NOT_FOUND / UNKNOWN — keep polling
      return false;
    };

    const run = async () => {
      // Phase 1: 5s initial delay, then poll up to 15× at 3s (~50s)
      await sleep(5000);

      const maxAttempts = 15;
      for (let i = 0; i < maxAttempts; i++) {
        if (await tryResolve()) return;
        if (i < maxAttempts - 1) await sleep(3000);
      }

      // Phase 2: slower polling 5× at 5s (~25s)
      const dbMaxAttempts = 5;
      for (let i = 0; i < dbMaxAttempts; i++) {
        if (await tryResolve()) return;

        try {
          const { data: payment } = await supabase
            .from("payments")
            .select("status")
            .eq("transaction_id", orderId)
            .maybeSingle();
          if (!payment && i >= dbMaxAttempts - 1) break;
        } catch {
          /* ignore */
        }

        if (i < dbMaxAttempts - 1) await sleep(5000);
      }

      // Final attempt — show "processing" rather than "unknown" if anything
      // hints the payment is still in-flight.
      try {
        const detail = await getOrderStatus(orderId);
        if (detail.status === "PENDING") {
          setResult({ status: "processing", orderId, amount: Number(detail.amount) });
          return;
        }
        if (detail.status === "SUCCESS") {
          setResult({
            status: "completed",
            orderId,
            amount: Number(detail.amount),
            transactionRef: detail.txn_id,
            paymentMethodLabel: buildMethodLabel(detail),
          });
          return;
        }
        if (detail.status === "FAILED") {
          setResult({ status: "failed", orderId, amount: Number(detail.amount) });
          return;
        }
        if (detail.status === "TAMPERED") {
          setResult({ status: "tampered", orderId, amount: Number(detail.amount) });
          return;
        }
      } catch {
        /* ignore */
      }

      // If we have an order_id we know about a transaction was started — never
      // fall all the way back to "Unknown" in that case. Show "processing"
      // so the user understands their payment may still be in-flight.
      setResult({ status: "processing", orderId });
    };

    run();
  }, [resolvedOrderId]);

  // Auto-redirect countdown only for SUCCESS — failed/processing/tampered
  // stay on this page so an unauthenticated student is never bounced into
  // /auth via a protected route navigation.
  useEffect(() => {
    if (result.status !== "completed") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/student/invoices");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result.status, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {result.status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Processing Payment</h2>
              <p className="text-muted-foreground">
                Verifying your payment securely… this may take up to a minute
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
            </>
          )}

          {result.status === "completed" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Successful</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Order ID: <span className="font-medium text-foreground">{result.orderId}</span>
                </p>
                {result.amount != null && (
                  <p>
                    Amount:{" "}
                    <span className="font-medium text-foreground">
                      ₹{Number(result.amount).toLocaleString("en-IN")}
                    </span>
                  </p>
                )}
                <p>
                  Status: <span className="font-medium text-green-600">SUCCESS</span>
                </p>
                {result.invoiceNumber && <p>Invoice: {result.invoiceNumber}</p>}
                {result.paymentMethodLabel && (
                  <p>
                    Paid via:{" "}
                    <span className="font-medium text-foreground">{result.paymentMethodLabel}</span>
                  </p>
                )}
                {result.transactionRef && <p>Transaction Ref: {result.transactionRef}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </>
          )}

          {result.status === "failed" && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Failed</h2>
              <p className="text-muted-foreground">
                Your payment could not be processed. Please try again.
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </>
          )}

          {result.status === "processing" && (
            <>
              <Clock className="h-16 w-16 text-amber-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">
                Payment is Being Processed
              </h2>
              <p className="text-muted-foreground">
                Your payment has been received and is being processed by the bank. It will be
                reflected in your invoices shortly.
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </>
          )}

          {result.status === "tampered" && (
            <>
              <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">
                Payment Verification Failed
              </h2>
              <p className="text-muted-foreground">
                We detected a mismatch while verifying this payment. Please contact support — do
                not retry without confirmation.
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </>
          )}

          {result.status === "not_found" && (
            <>
              <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Status Unknown</h2>
              <p className="text-muted-foreground">
                We couldn't determine the payment status. If money was deducted, it will be
                reflected within 24 hours.
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
