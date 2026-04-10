import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";

async function fetchOrderStatus(orderId: string) {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hdfc-order-status`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ order_id: orderId }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Function failed: ${res.status}`);
  }
  return res.json();
}

type PaymentResult = {
  status: "loading" | "completed" | "failed" | "not_found";
  orderId: string;
  amount?: number;
  invoiceNumber?: string;
  transactionRef?: string;
};

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<PaymentResult>({
    status: "loading",
    orderId: searchParams.get("order_id") || "",
  });

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (!orderId) {
      setResult({ status: "not_found", orderId: "" });
      return;
    }

    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      try {
        // First try server-side order status from HDFC
        const orderResult = await getOrderStatus(orderId);
        if (orderResult.status === "SUCCESS") {
          setResult({
            status: "completed",
            orderId,
            amount: orderResult.amount,
            transactionRef: orderResult.txn_id || "",
          });
          return;
        } else if (orderResult.status === "FAILED") {
          setResult({ status: "failed", orderId, amount: orderResult.amount });
          return;
        }
      } catch (err) {
        console.error("hdfc-order-status check failed:", err);
        // Fallback to DB polling below
      }

      // DB polling fallback
      const { data: payment } = await supabase
        .from("payments")
        .select("*, invoices(invoice_number)")
        .eq("transaction_id", orderId)
        .single();

      if (payment && payment.status === "completed") {
        setResult({
          status: "completed",
          orderId,
          amount: payment.amount,
          invoiceNumber: (payment.invoices as any)?.invoice_number || "",
          transactionRef: payment.transaction_reference || "",
        });
        return;
      }
      if (payment && payment.status === "failed") {
        setResult({ status: "failed", orderId, amount: payment.amount });
        return;
      }
      // If payment exists but is still pending, keep polling

      attempts++;
      if (attempts >= maxAttempts) {
        setResult({ status: "not_found", orderId, amount: payment?.amount });
        return;
      }

      setTimeout(poll, 2000);
    };

    poll();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {result.status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Processing Payment</h2>
              <p className="text-muted-foreground">Please wait while we verify your payment...</p>
              <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
            </>
          )}

          {result.status === "completed" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Successful!</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                {result.invoiceNumber && <p>Invoice: {result.invoiceNumber}</p>}
                {result.amount && <p>Amount: ₹{result.amount.toLocaleString("en-IN")}</p>}
                {result.transactionRef && <p>Transaction Ref: {result.transactionRef}</p>}
                <p>Order ID: {result.orderId}</p>
              </div>
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
              <Button onClick={() => navigate("/student/dashboard")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </>
          )}

          {result.status === "not_found" && (
            <>
              <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment Status Unknown</h2>
              <p className="text-muted-foreground">
                We couldn't determine the payment status. If money was deducted, it will be reflected within 24 hours.
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
