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

    // Server-trusted result mapper. We render UI ONLY from this verified response.
    const applyVerified = async (): Promise<boolean> => {
      try {
        const v = await verifyPayment(orderId);
        if (v.status === "SUCCESS") {
          sessionStorage.removeItem("hdfc_pending_order_id");
          setResult({
            status: "completed",
            orderId: v.order_id,
            amount: v.amount,
            invoiceNumber: v.invoice_number,
            transactionRef: v.hdfc_txn_id,
          });
          return true;
        }
        if (v.status === "FAILED") {
          sessionStorage.removeItem("hdfc_pending_order_id");
          setResult({ status: "failed", orderId: v.order_id, amount: v.amount });
          return true;
        }
        if (v.status === "TAMPERED") {
          sessionStorage.removeItem("hdfc_pending_order_id");
          setResult({ status: "tampered", orderId: v.order_id, amount: v.amount });
          return true;
        }
        return false; // INITIATED / PENDING / NOT_FOUND — keep polling
      } catch (e) {
        console.error("verifyPayment failed:", e);
        return false;
      }
    };

    const run = async () => {
      // Phase 1: 5s initial delay, then poll HDFC 15× at 3s (~50s)
      await sleep(5000);

      const maxAttempts = 15;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          // Drives the server-side status sync into payment_transactions
          await getOrderStatus(orderId);
        } catch (err) {
          console.error("hdfc-order-status check failed:", err);
        }

        // Read trusted view
        if (await applyVerified()) return;

        if (i < maxAttempts - 1) await sleep(3000);
      }

      // Phase 2: DB polling 5× at 5s (~25s)
      const dbMaxAttempts = 5;
      for (let i = 0; i < dbMaxAttempts; i++) {
        if (await applyVerified()) return;

        // Optional: peek payments table to decide whether to keep waiting
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

      // One last verified check, else processing/not_found
      try {
        const v = await verifyPayment(orderId);
        if (v.status === "PENDING" || v.status === "INITIATED") {
          setResult({ status: "processing", orderId: v.order_id, amount: v.amount });
          return;
        }
        if (v.status === "SUCCESS") {
          setResult({
            status: "completed",
            orderId: v.order_id,
            amount: v.amount,
            invoiceNumber: v.invoice_number,
            transactionRef: v.hdfc_txn_id,
          });
          return;
        }
        if (v.status === "FAILED") {
          setResult({ status: "failed", orderId: v.order_id, amount: v.amount });
          return;
        }
        if (v.status === "TAMPERED") {
          setResult({ status: "tampered", orderId: v.order_id, amount: v.amount });
          return;
        }
      } catch {
        /* ignore */
      }

      setResult({ status: "not_found", orderId });
    };

    run();
  }, [resolvedOrderId]);

  // Auto-redirect countdown once status is resolved
  useEffect(() => {
    if (result.status === "loading") return;

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
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
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
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
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
