I found several likely causes behind the current outcome:

1. The latest payment attempt `ANT6kXhzZoq2464` only has a session-create log and is still `INITIATED`; no status-sync log ran after the redirect.
2. The preview payment flow is sending HDFC back to `https://hostylia.com/student/payment/status` instead of the same origin where the student started payment. That explains why the user can land on the status page without the original login session and then gets redirected to `/auth` when the page auto-navigates to `/student/invoices`.
3. The status polling can hit HDFC rate limits (`429`) and the current function can collapse that into `UNKNOWN`, which causes the “Payment Status Unknown” page.
4. Invoice dues are only updated when the payment sync reaches the exact successful path. If the redirect/polling/webhook misses or partially syncs, the payment can be successful at HDFC while the local invoice still shows dues.
5. The webhook updates `payments`/`invoices` but does not consistently update `payment_transactions`, so the latest payment status shown in the student invoice card can remain stale.

Plan to fix and test:

1. Make the return flow domain-safe
   - Stop forcing preview payments to return to `hostylia.com`.
   - Use a backend callback bridge for HDFC return URLs, carrying the original app origin safely.
   - The callback will verify/sync the payment server-side, then redirect the browser back to the same app origin:

```text
Student app -> HDFC checkout -> backend callback -> /student/payment/status?order_id=...
```

2. Harden the HDFC callback
   - Support both GET/query-param and POST/form callback formats.
   - Extract `order_id` from query string, form body, JSON body, or saved transaction data.
   - Call the order-status sync before redirecting to the UI.
   - Return a browser redirect instead of JSON so the student always lands on the status page.

3. Fix status syncing and rate-limit handling
   - Update `hdfc-order-status` so all non-2xx gateway responses, especially `429`, are handled as transient/processing when a local transaction exists.
   - Never show `UNKNOWN` just because HDFC rate-limited a polling request.
   - Reduce frontend polling pressure and use safer backoff to avoid repeated HDFC `429` responses.

4. Make invoice reconciliation idempotent
   - Add a shared reconciliation flow inside the payment functions:
     - Mark payment row `completed` on success or `failed` on failure.
     - Recompute invoice paid amount from completed payment rows instead of blindly adding again.
     - Set invoice status to `paid`, `partial`, or `pending` based on the recomputed paid amount.
   - This prevents duplicate counting and also fixes cases where a successful gateway transaction did not update dues.

5. Keep transaction status consistent
   - Update `hdfc-webhook` to also update `payment_transactions` on success/failure.
   - Ensure `payment_transactions`, `payments`, and `invoices` remain in sync regardless of whether the success is detected by redirect polling, callback, or webhook.

6. Improve the payment status UI behavior
   - If the user is not logged in on the status page, still show the payment result using the public server-verified status.
   - Do not auto-redirect an unauthenticated user into `/student/invoices`, which currently causes `/auth` immediately.
   - If authenticated, redirect back to invoices after success and refresh invoice/payment queries.
   - Replace final “Payment Status Unknown” with a safer “Still Processing” state when a local transaction exists but HDFC has not returned a final status yet.

7. Manual end-to-end test after implementation
   - Start from the student invoices page.
   - Initiate payment for an unpaid/partially paid invoice.
   - Complete payment on the HDFC UAT checkout manually.
   - Confirm redirect lands on the correct app origin.
   - Confirm the status page shows one of: Successful, Pending/Processing, or Failed, not Unknown for a valid transaction.
   - Confirm it does not redirect to `/auth` when the original student session is valid.
   - Confirm invoice dues, paid amount, payment row, transaction row, and payment details card all update consistently.
   - Also test an abandoned payment path to ensure it remains pending/initiated without incorrectly increasing paid amount.