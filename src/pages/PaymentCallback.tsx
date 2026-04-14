import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrderStatus } from "@/lib/hdfc";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "SUCCESS" | "FAILED" | "UNKNOWN">("loading");
  const [details, setDetails] = useState<Record<string, any>>({});
  const [countdown, setCountdown] = useState(5);

  // Read order_id from URL params first, fall back to sessionStorage
  const orderId = searchParams.get("order_id") || sessionStorage.getItem("hdfc_pending_order_id") || "";

  useEffect(() => {
    if (!orderId) {
      setStatus("UNKNOWN");
      return;
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const pollOrderStatus = async () => {
      const maxAttempts = 6;
      let lastResult: any = null;
      let _lastError: unknown = null;

      for (let i = 0; i < maxAttempts; i++) {
        try {
          lastResult = await getOrderStatus(orderId);
          if (lastResult.status === "SUCCESS" || lastResult.status === "FAILED") {
            sessionStorage.removeItem("hdfc_pending_order_id");
            setStatus(lastResult.status);
            setDetails(lastResult);
            return;
          }
        } catch (err) {
          _lastError = err;
        }
        if (i < maxAttempts - 1) await sleep(2000);
      }

      // All attempts exhausted
      if (lastResult) {
        setStatus(lastResult.status === "PENDING" ? "UNKNOWN" : lastResult.status);
        setDetails(lastResult);
      } else {
        setStatus("UNKNOWN");
      }
    };

    pollOrderStatus();
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
              <p className="text-muted-foreground">Verifying your payment… (this may take a few seconds)</p>
              <p className="text-xs text-muted-foreground">Order ID: {orderId}</p>
            </>
          )}

          {status === "SUCCESS" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Successful!</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                {details.amount && <p>Amount: ₹{Number(details.amount).toLocaleString("en-IN")}</p>}
                {details.txn_id && <p>Transaction ID: {details.txn_id}</p>}
                <p>Order ID: {orderId}</p>
              </div>
              <p className="text-xs text-muted-foreground">Redirecting to invoices in {countdown}s...</p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
              </Button>
            </>
          )}

          {status === "FAILED" && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Failed</h2>
              <p className="text-muted-foreground">Your payment could not be processed. Please try again.</p>
              <p className="text-xs text-muted-foreground">Order ID: {orderId}</p>
              <p className="text-xs text-muted-foreground">Redirecting to invoices in {countdown}s...</p>
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
                We couldn't determine the status. If money was deducted, it will be reflected within 24 hours.
              </p>
              <p className="text-xs text-muted-foreground">Redirecting to invoices in {countdown}s...</p>
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
