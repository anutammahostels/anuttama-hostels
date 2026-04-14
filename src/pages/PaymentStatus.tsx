import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Clock } from "lucide-react";

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
  status: "loading" | "completed" | "failed" | "not_found" | "processing";
  orderId: string;
  amount?: number;
  invoiceNumber?: string;
  transactionRef?: string;
};

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const resolvedOrderId = searchParams.get("order_id") || sessionStorage.getItem("hdfc_pending_order_id") || "";

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

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const pollOrderStatus = async () => {
      // Phase 1: Wait 5s initial delay, then poll HDFC 15 times at 3s intervals (~50s)
      await sleep(5000);

      const maxAttempts = 15;
      let lastOrderResult: any = null;

      for (let i = 0; i < maxAttempts; i++) {
        try {
          lastOrderResult = await fetchOrderStatus(orderId);
          if (lastOrderResult.status === "SUCCESS") {
            sessionStorage.removeItem("hdfc_pending_order_id");
            setResult({
              status: "completed",
              orderId,
              amount: lastOrderResult.amount,
              transactionRef: lastOrderResult.txn_id || "",
            });
            return;
          } else if (lastOrderResult.status === "FAILED") {
            sessionStorage.removeItem("hdfc_pending_order_id");
            setResult({ status: "failed", orderId, amount: lastOrderResult.amount });
            return;
          }
        } catch (err) {
          console.error("hdfc-order-status check failed:", err);
        }
        if (i < maxAttempts - 1) await sleep(3000);
      }

      // Phase 2: Poll DB 5 times at 5s intervals (~25s more)
      const dbMaxAttempts = 5;
      for (let i = 0; i < dbMaxAttempts; i++) {
        try {
          const { data: payment } = await supabase
            .from("payments")
            .select("*, invoices(invoice_number)")
            .eq("transaction_id", orderId)
            .single();

          if (payment && payment.status === "completed") {
            sessionStorage.removeItem("hdfc_pending_order_id");
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
            sessionStorage.removeItem("hdfc_pending_order_id");
            setResult({ status: "failed", orderId, amount: payment.amount });
            return;
          }

          // Payment exists but still pending — keep polling
          if (payment && payment.status === "pending") {
            if (i < dbMaxAttempts - 1) {
              await sleep(5000);
              continue;
            }
            // Last attempt, still pending — show processing state
            setResult({ status: "processing", orderId, amount: payment.amount });
            return;
          }
        } catch {
          // DB lookup failed, continue polling
        }
        if (i < dbMaxAttempts - 1) await sleep(5000);
      }

      setResult({ status: "not_found", orderId, amount: lastOrderResult?.amount });
    };

    pollOrderStatus();
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
              <p className="text-muted-foreground">Verifying your payment… this may take up to a minute</p>
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
              <p className="text-xs text-muted-foreground">Redirecting to invoices in {countdown}s...</p>
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
              <p className="text-xs text-muted-foreground">Redirecting to invoices in {countdown}s...</p>
              <Button onClick={() => navigate("/student/invoices")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </>
          )}

          {result.status === "processing" && (
            <>
              <Clock className="h-16 w-16 text-amber-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Payment is Being Processed</h2>
              <p className="text-muted-foreground">
                Your payment has been received and is being processed by the bank. It will be reflected in your invoices shortly.
              </p>
              <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
              <p className="text-xs text-muted-foreground">Redirecting to invoices in {countdown}s...</p>
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
                We couldn't determine the payment status. If money was deducted, it will be reflected within 24 hours.
              </p>
              <p className="text-xs text-muted-foreground">Redirecting to invoices in {countdown}s...</p>
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
