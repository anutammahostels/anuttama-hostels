import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrderStatus, verifyPayment } from "@/lib/hdfc";
import { CheckCircle, XCircle, Loader2, ArrowLeft, ShieldAlert, Clock } from "lucide-react";

type UiStatus = "loading" | "SUCCESS" | "FAILED" | "UNKNOWN" | "TAMPERED" | "PROCESSING";

type Details = {
  amount?: number | null;
  txn_id?: string | null;
  invoice_number?: string | null;
};

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<UiStatus>("loading");
  const [details, setDetails] = useState<Details>({});
  const [countdown, setCountdown] = useState(5);

  const orderId =
    searchParams.get("order_id") || sessionStorage.getItem("hdfc_pending_order_id") || "";

  useEffect(() => {
    if (!orderId) {
      setStatus("UNKNOWN");
      return;
    }

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Trusts hdfc-order-status (server-verified + DB-synced) and uses
    // hdfc-verify-payment only for invoice metadata. Verify failures are
    // non-fatal so transient auth issues never block a known-good status.
    const tryResolve = async (): Promise<boolean> => {
      let detail: Awaited<ReturnType<typeof getOrderStatus>> | null = null;
      try {
        detail = await getOrderStatus(orderId);
      } catch (err) {
        console.error("hdfc-order-status check failed:", err);
      }

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
      const txn_id = detail?.txn_id ?? verified?.hdfc_txn_id ?? null;
      const invoice_number = verified?.invoice_number ?? null;

      if (finalStatus === "SUCCESS") {
        sessionStorage.removeItem("hdfc_pending_order_id");
        setStatus("SUCCESS");
        setDetails({ amount, txn_id, invoice_number });
        return true;
      }
      if (finalStatus === "FAILED") {
        sessionStorage.removeItem("hdfc_pending_order_id");
        setStatus("FAILED");
        setDetails({ amount });
        return true;
      }
      if (finalStatus === "TAMPERED") {
        sessionStorage.removeItem("hdfc_pending_order_id");
        setStatus("TAMPERED");
        setDetails({ amount });
        return true;
      }
      return false;
    };

    const run = async () => {
      await sleep(5000);

      const maxAttempts = 15;
      for (let i = 0; i < maxAttempts; i++) {
        if (await tryResolve()) return;
        if (i < maxAttempts - 1) await sleep(3000);
      }

      // Final attempt — show processing if still pending
      try {
        const detail = await getOrderStatus(orderId);
        if (detail.status === "SUCCESS") {
          setStatus("SUCCESS");
          setDetails({ amount: Number(detail.amount), txn_id: detail.txn_id });
          return;
        }
        if (detail.status === "FAILED") {
          setStatus("FAILED");
          setDetails({ amount: Number(detail.amount) });
          return;
        }
        if (detail.status === "TAMPERED") {
          setStatus("TAMPERED");
          setDetails({ amount: Number(detail.amount) });
          return;
        }
        if (detail.status === "PENDING") {
          setStatus("PROCESSING");
          setDetails({ amount: Number(detail.amount) });
          return;
        }
      } catch {
        /* ignore */
      }

      setStatus("UNKNOWN");
    };

    run();
  }, [orderId]);

  // Auto-redirect countdown once status is resolved
  useEffect(() => {
    if (status === "loading") return;

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
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Verifying Payment</h2>
              <p className="text-muted-foreground">
                Verifying your payment securely… this may take up to a minute
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {orderId}</p>
            </>
          )}

          {status === "SUCCESS" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Successful</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Order ID: <span className="font-medium text-foreground">{orderId}</span>
                </p>
                {details.amount != null && (
                  <p>
                    Amount:{" "}
                    <span className="font-medium text-foreground">
                      ₹{Number(details.amount).toLocaleString("en-IN")}
                    </span>
                  </p>
                )}
                <p>
                  Status: <span className="font-medium text-green-600">SUCCESS</span>
                </p>
                {details.invoice_number && <p>Invoice: {details.invoice_number}</p>}
                {details.txn_id && <p>Transaction ID: {details.txn_id}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
              </Button>
            </>
          )}

          {status === "FAILED" && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Failed</h2>
              <p className="text-muted-foreground">
                Your payment could not be processed. Please try again.
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {orderId}</p>
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
              </Button>
            </>
          )}

          {status === "PROCESSING" && (
            <>
              <Clock className="h-16 w-16 text-amber-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">
                Payment is Being Processed
              </h2>
              <p className="text-muted-foreground">
                Your payment has been received and is being processed by the bank. It will be
                reflected in your invoices shortly.
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {orderId}</p>
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
              </Button>
            </>
          )}

          {status === "TAMPERED" && (
            <>
              <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">
                Payment Verification Failed
              </h2>
              <p className="text-muted-foreground">
                We detected a mismatch while verifying this payment. Please contact support.
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {orderId}</p>
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
              </Button>
            </>
          )}

          {status === "UNKNOWN" && (
            <>
              <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Status Unknown</h2>
              <p className="text-muted-foreground">
                We couldn't determine the status. If money was deducted, it will be reflected
                within 24 hours.
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to invoices in {countdown}s...
              </p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
