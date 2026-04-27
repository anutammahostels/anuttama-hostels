import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getOrderStatus, verifyPayment, recoverLatestOrder } from "@/lib/hdfc";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Clock, ShieldAlert } from "lucide-react";

type UiStatus =
  | "loading"
  | "completed"
  | "failed"
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

// A status is "terminal" once we've shown it to the user; later polling
// must NEVER downgrade it (e.g. from completed back to processing).
const TERMINAL: UiStatus[] = ["completed", "failed", "tampered"];

const REDIRECT_DELAYS: Record<UiStatus, number> = {
  loading: 0,
  completed: 5,
  failed: 6,
  tampered: 10,
  processing: 8,
};

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialOrderId =
    searchParams.get("order_id") ||
    sessionStorage.getItem("hdfc_pending_order_id") ||
    localStorage.getItem("hdfc_pending_order_id") ||
    "";

  // URL-supplied hint from the backend callback redirect:
  // success | failed | pending | tampered
  const hint = (searchParams.get("payment_result") || "").toLowerCase();
  const initialFromHint: UiStatus | null =
    hint === "success" ? "completed" :
    hint === "failed" ? "failed" :
    hint === "tampered" ? "tampered" :
    hint === "pending" ? "processing" :
    null;

  const [result, setResult] = useState<PaymentResult>({
    status: initialFromHint ?? "loading",
    orderId: initialOrderId,
  });

  // Keep a ref so polling callbacks always see the latest status without
  // causing re-renders or downgrade races.
  const resultRef = useRef(result);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const safeSetStatus = (next: PaymentResult | ((p: PaymentResult) => PaymentResult)) => {
    setResult((prev) => {
      const candidate = typeof next === "function" ? (next as any)(prev) : next;
      // Never downgrade a terminal state.
      if (TERMINAL.includes(prev.status) && !TERMINAL.includes(candidate.status)) {
        return prev;
      }
      // Once in "processing" with an order id, never fall back to "loading".
      if (prev.status === "processing" && candidate.status === "loading") {
        return prev;
      }
      return candidate;
    });
  };

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const tryResolve = async (orderId: string): Promise<boolean> => {
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
      const invoiceNumber = verified?.invoice_number ?? null;
      const transactionRef = detail?.txn_id ?? verified?.hdfc_txn_id ?? null;

      if (cancelled) return true;

      if (finalStatus === "SUCCESS") {
        sessionStorage.removeItem("hdfc_pending_order_id");
        localStorage.removeItem("hdfc_pending_order_id");
        safeSetStatus({
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
        localStorage.removeItem("hdfc_pending_order_id");
        safeSetStatus({ status: "failed", orderId, amount });
        return true;
      }
      if (finalStatus === "TAMPERED") {
        sessionStorage.removeItem("hdfc_pending_order_id");
        localStorage.removeItem("hdfc_pending_order_id");
        safeSetStatus({ status: "tampered", orderId, amount });
        return true;
      }
      // PENDING / INITIATED / NOT_FOUND / UNKNOWN — keep polling but make
      // sure the UI doesn't sit on "loading" indefinitely.
      safeSetStatus((prev) =>
        prev.status === "loading" ? { ...prev, status: "processing", orderId } : prev
      );
      return false;
    };

    const resolveOrderId = async (): Promise<string> => {
      if (initialOrderId) return initialOrderId;

      // Wait briefly for the user's auth/session to hydrate before
      // calling the recovery endpoint.
      for (let i = 0; i < 6; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) break;
        await sleep(800);
      }

      try {
        const recovered = await recoverLatestOrder();
        if (recovered?.order_id) {
          sessionStorage.setItem("hdfc_pending_order_id", recovered.order_id);
          return recovered.order_id;
        }
      } catch (err) {
        console.error("recoverLatestOrder failed:", err);
      }
      return "";
    };

    const run = async () => {
      const orderId = await resolveOrderId();

      if (!orderId) {
        // No context anywhere — show "processing" (never "no payment found")
        // and keep retrying recovery in the background.
        if (!cancelled) safeSetStatus({ status: "processing", orderId: "" });

        for (let i = 0; i < 8; i++) {
          await sleep(4000);
          if (cancelled) return;
          if (TERMINAL.includes(resultRef.current.status)) return;
          try {
            const recovered = await recoverLatestOrder();
            if (recovered?.order_id) {
              if (cancelled) return;
              safeSetStatus((prev) => ({ ...prev, orderId: recovered.order_id! }));
              return runWithOrderId(recovered.order_id);
            }
          } catch (err) {
            console.error("recoverLatestOrder retry failed:", err);
          }
        }

        // After ~32s with nothing recoverable, stay on "processing" — we
        // never want to tell the user there is no payment when they just
        // completed a checkout.
        return;
      }

      return runWithOrderId(orderId);
    };

    const runWithOrderId = async (orderId: string) => {
      if (!cancelled) {
        safeSetStatus((prev) => ({ ...prev, orderId }));
      }

      // Phase 1: short delay then aggressive polling
      await sleep(2000);
      const maxAttempts = 15;
      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return;
        if (TERMINAL.includes(resultRef.current.status)) return;
        if (await tryResolve(orderId)) return;
        if (i < maxAttempts - 1) await sleep(3000);
      }

      // Phase 2: slower polling
      const dbMaxAttempts = 5;
      for (let i = 0; i < dbMaxAttempts; i++) {
        if (cancelled) return;
        if (TERMINAL.includes(resultRef.current.status)) return;
        if (await tryResolve(orderId)) return;
        if (i < dbMaxAttempts - 1) await sleep(5000);
      }

      // Final attempt — show "processing" rather than "unknown"
      if (cancelled) return;
      if (TERMINAL.includes(resultRef.current.status)) return;
      try {
        const detail = await getOrderStatus(orderId);
        if (detail.status === "PENDING") {
          safeSetStatus({ status: "processing", orderId, amount: Number(detail.amount) });
          return;
        }
        if (detail.status === "SUCCESS") {
          safeSetStatus({
            status: "completed",
            orderId,
            amount: Number(detail.amount),
            transactionRef: detail.txn_id,
            paymentMethodLabel: buildMethodLabel(detail),
          });
          return;
        }
        if (detail.status === "FAILED") {
          safeSetStatus({ status: "failed", orderId, amount: Number(detail.amount) });
          return;
        }
        if (detail.status === "TAMPERED") {
          safeSetStatus({ status: "tampered", orderId, amount: Number(detail.amount) });
          return;
        }
      } catch {
        /* ignore */
      }

      // We have an order_id, so prefer "processing" over anything else.
      safeSetStatus((prev) =>
        TERMINAL.includes(prev.status) ? prev : { status: "processing", orderId }
      );
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [initialOrderId]);

  // Auto-redirect to invoices once we are in any non-loading state.
  // We wait briefly to give the user time to see the result, and to let
  // the auth session hydrate so we don't get bounced to /auth.
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (result.status === "loading") {
      setCountdown(null);
      return;
    }
    setCountdown(REDIRECT_DELAYS[result.status]);
  }, [result.status]);

  useEffect(() => {
    if (countdown == null) return;
    if (countdown <= 0) {
      // Wait briefly for auth session before navigating to a protected route
      (async () => {
        for (let i = 0; i < 8; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session) break;
          await new Promise((r) => setTimeout(r, 500));
        }
        navigate("/student/invoices");
      })();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c == null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  const goToInvoicesNow = () => {
    setCountdown(null);
    navigate("/student/invoices");
  };

  const RedirectNote = () =>
    countdown != null && countdown > 0 ? (
      <p className="text-xs text-muted-foreground">
        Redirecting to invoices in {countdown}s…
      </p>
    ) : null;

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
              {result.orderId && (
                <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
              )}
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
              <RedirectNote />
              <Button onClick={goToInvoicesNow} className="w-full">
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
                Your payment could not be processed. Please try again from your invoices.
              </p>
              {result.orderId && (
                <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
              )}
              <RedirectNote />
              <Button onClick={goToInvoicesNow} className="w-full">
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
              {result.orderId && (
                <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
              )}
              <RedirectNote />
              <Button onClick={goToInvoicesNow} className="w-full">
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
              {result.orderId && (
                <p className="text-xs text-muted-foreground">Order ID: {result.orderId}</p>
              )}
              <RedirectNote />
              <Button onClick={goToInvoicesNow} className="w-full">
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
