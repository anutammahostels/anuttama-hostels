I found the current issue: the latest successful payment is being received and reconciled locally (`ANTV1AEdUxy8858` is `SUCCESS`, payment is `completed`, invoice is `paid`). The UI problem is caused by two gaps:

1. HDFC is still being given a frontend return URL (`https://anuttamahostels.com/student/payment/status?...`) instead of the backend callback bridge, so the app status page has to do all verification itself after a cross-domain redirect.
2. The status page can temporarily switch from success to processing/not-found when local storage is cleared or when it reruns without a stable `order_id/session`. That is why you see the successful screen, then the processing screen, then “No Recent Payment Found”.

Plan to fix this in one go:

1. Route all HDFC returns through the backend callback
   - Update `hdfc-create-session` so `return_url` sent to HDFC is always the backend callback bridge.
   - Preserve the original app origin/status page in a safe `app_return_to` parameter so the user is redirected back to the same domain they started from.
   - This matches HDFC guidance: return URL hits backend first, backend validates/queries order status, then frontend shows the final status.

2. Make the callback bridge decide the final app URL
   - Update `hdfc-payment-callback` to parse HDFC’s returned query parameters including `status`, `status_id`, `order_id`, and signature fields.
   - Trigger server-side order status verification before redirecting.
   - Redirect to `/student/payment/status?order_id=...&payment_result=success|failed|pending|tampered` on the correct original app domain.
   - Keep callback logging so we can confirm exactly what HDFC returns.

3. Rewrite the payment status screen as a stable finite-state flow
   - Once a terminal state is shown (`completed`, `failed`, `tampered`), never allow later polling/recovery attempts to downgrade it to `processing` or `not_found`.
   - Remove the “No Recent Payment Found” state from the post-gateway flow when there is any evidence of a payment attempt.
   - If `order_id` is missing after return, keep showing a safe recovery/processing message and retry recovery, instead of showing “No Recent Payment Found”.

4. Add controlled redirects to invoices as requested
   - Success: show “Payment Successful” briefly, then redirect to `/student/invoices`.
   - Failed: show “Payment Failed” briefly, then redirect to `/student/invoices`.
   - Pending/processing: show “Payment Pending / Being Processed” briefly, then redirect to `/student/invoices`.
   - If the auth session is not ready when redirecting, avoid sending the user to `/auth` immediately; show a clear sign-in/return button or wait briefly for session hydration first.

5. Refresh invoice data on return
   - Update `StudentInvoices` so returning from payment invalidates/refetches invoice queries.
   - Ignore stale pending payment rows when the invoice is already paid, so the invoice section reflects the actual paid state.

Technical details:
- Files to update: `supabase/functions/hdfc-create-session/index.ts`, `supabase/functions/hdfc-payment-callback/index.ts`, `src/pages/PaymentStatus.tsx`, `src/pages/student/StudentInvoices.tsx`, and possibly remove/align the older `src/pages/PaymentCallback.tsx` behavior if it can conflict.
- Deploy updated backend functions after changes: `hdfc-create-session`, `hdfc-payment-callback`, and any verifier function touched.
- Validate using the latest successful order and then a fresh test payment: success should remain success until redirect, failed should show failed then redirect, pending should show pending then redirect, and “No Recent Payment Found” should not appear after a known gateway return.