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

  const orderId = searchParams.get("order_id") || "";

  useEffect(() => {
    if (!orderId) {
      setStatus("UNKNOWN");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const check = async () => {
      try {
        const result = await getOrderStatus(orderId);
        if (result.status === "SUCCESS" || result.status === "FAILED") {
          setStatus(result.status);
          setDetails(result);
          return;
        }
        attempts++;
        if (attempts >= maxAttempts) {
          setStatus(result.status === "PENDING" ? "UNKNOWN" : result.status);
          setDetails(result);
          return;
        }
        setTimeout(check, 3000);
      } catch {
        attempts++;
        if (attempts >= maxAttempts) {
          setStatus("UNKNOWN");
          return;
        }
        setTimeout(check, 3000);
      }
    };

    check();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Verifying Payment</h2>
              <p className="text-muted-foreground">Please wait while we confirm your payment with the bank...</p>
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
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
              </Button>
            </>
          )}

          {status === "FAILED" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Failed</h2>
              <p className="text-muted-foreground">Your payment could not be processed. Please try again.</p>
              <p className="text-xs text-muted-foreground">Order ID: {orderId}</p>
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
