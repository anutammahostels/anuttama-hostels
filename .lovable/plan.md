I found the latest payment did reach HDFC successfully and was synced locally: order `ANTo4EGHfc96389` returned `CHARGED/SUCCESSFUL`, and the invoice is marked paid in the database. The problem is the success screen auto-redirects to invoices after 5 seconds, but the browser is losing the student login session because the HDFC return URL sometimes uses a different domain/origin (`anuttamahostels.com` vs the preview/app origin). Once the session is missing, the app sends the user to `/auth`; if they revisit the status page without a recoverable session/order, it shows “No Recent Payment Found”.

Plan to fix:

1. Stop using a plain frontend URL as the HDFC return target
   - Change `hdfc-create-session` so HDFC always returns to the backend callback bridge first.
   - Pass the original app origin/status URL as metadata/query data so the backend can safely send the user back to the same origin they started from.

2. Make the callback bridge preserve payment context reliably
   - Update `hdfc-payment-callback` to redirect back to `/student/payment/status?order_id=...&customer_id=...` on the correct app origin.
   - Keep logging raw callback data so we can prove whether HDFC sent the response.
   - Trigger server-side order verification before redirecting, so the database is already reconciled when the status page opens.

3. Fix the status page behavior after success
   - Remove the automatic redirect from the successful payment screen, or make it safer by staying on the success page until the student clicks “Back to Invoices”.
   - This prevents the success page from immediately sending the user into a protected route while their auth session is still unstable after cross-domain return.
   - Keep the successful order visible with amount, order ID, and transaction reference.

4. Harden “No Recent Payment Found” fallback
   - If `order_id` is present in the URL, never replace a known success with the “No Recent Payment Found” screen.
   - If the user is not authenticated after gateway return, show a clear “Payment captured, please sign in to view invoices” message instead of a false no-payment message.

5. Ensure invoices refresh correctly after payment
   - In `StudentInvoices`, ignore stale pending payment rows once the invoice is paid.
   - Keep totals based on invoice `paid_amount/status`, and ensure the query refreshes when returning from payment.

Technical details:
- Files to update: `supabase/functions/hdfc-create-session/index.ts`, `supabase/functions/hdfc-payment-callback/index.ts`, `src/pages/PaymentStatus.tsx`, and possibly `src/pages/student/StudentInvoices.tsx`.
- Redeploy the modified backend functions after code changes.
- Validate with the known successful order and then a fresh test payment: HDFC response should be `CHARGED`, status page should remain “Payment Successful”, and invoices should show no pending due for the paid invoice.