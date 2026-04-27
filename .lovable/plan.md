I checked the latest payment records and HDFC function logs.

Findings:
- For order `ANTFnUhjo377929`, HDFC did return a successful response: `status: CHARGED`, `resp_code: 00`, `resp_message: SUCCESSFUL`, `txn_id: SG4845-ANTFnUhjo377929-1`. That order was updated to `SUCCESS`.
- For the later order `ANTyHxb1mGY3738`, the database still shows `INITIATED`, and there are no `hdfc-order-status`, `hdfc-verify-payment`, webhook, or callback logs for it after session creation. This means the app did not successfully check HDFC after returning to the status page for that order.
- The screenshot shows `/student/payment/status` without an `order_id` in the URL. Since the route depends on `order_id` or browser `sessionStorage`, the page falls into “Payment Status Unknown” when that value is missing.
- No HDFC callback/webhook logs were received, so the system currently depends on frontend polling. If polling is not triggered because `order_id` is missing, the successful/pending/failed state is never fetched from HDFC.

Plan to fix:

1. Make payment status work even when HDFC strips query parameters
   - Store enough pending payment context locally before redirecting to HDFC: `order_id`, `invoice_id`, and a timestamp.
   - On `/student/payment/status`, if `order_id` is missing from the URL, recover it from saved pending payment context.
   - If multiple recent pending orders exist, use the most recent one instead of showing “Unknown”.

2. Add a backend recovery lookup for recent pending payments
   - Update `hdfc-verify-payment` or add a safe mode to return the student’s most recent `INITIATED`/`PENDING` transaction when the status page has no `order_id`.
   - Keep authorization checks so a student can only recover their own transaction.

3. Force server-side HDFC verification after redirect
   - Ensure `PaymentStatus.tsx` calls `hdfc-order-status` once an order is recovered.
   - If HDFC returns `CHARGED`, immediately mark `payment_transactions` as `SUCCESS`, mark the matching `payments` row as `completed`, and reconcile the invoice paid amount.
   - If HDFC returns bank pending states, show “Payment is Being Processed”, not “Unknown”.
   - If HDFC returns failure states, show “Payment Failed”.

4. Fix the public callback/webhook gap
   - Update `hdfc-payment-callback` so it accepts HDFC GET and POST redirects, reads `order_id` from query string or body, calls `hdfc-order-status`, then redirects the browser to `/student/payment/status?order_id=...`.
   - Add raw callback logging for both GET and POST so we can prove whether HDFC is calling us.
   - Ensure the HDFC session return URL points to this backend callback bridge when appropriate, so the server gets first chance to verify the payment before the user sees the status page.

5. Improve the status page UX
   - Remove the final “Payment Status Unknown” fallback when a payment was recently initiated.
   - Show the exact current state: Successful, Processing/Pending, Failed, or Verification Failed.
   - Display the order ID clearly for support/debugging.
   - Prevent redirecting to `/auth` while the payment status page is still resolving.

6. Re-test with the latest orders
   - Call the payment status function directly for `ANTyHxb1mGY3738` to see what HDFC currently returns.
   - Verify that successful responses update all three places consistently: `payment_transactions`, `payments`, and `invoices`.
   - Then perform a fresh end-to-end test and confirm the page no longer lands on “Payment Status Unknown”.

Technical files to update:
- `src/pages/student/StudentInvoices.tsx`
- `src/pages/PaymentStatus.tsx`
- `supabase/functions/hdfc-payment-callback/index.ts`
- `supabase/functions/hdfc-verify-payment/index.ts`
- Possibly `supabase/functions/hdfc-order-status/index.ts` if recovery/reconciliation needs one more hardening pass.