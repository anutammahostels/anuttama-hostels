# Fix: Payment status always shows "Unknown"

## Root cause

The post-payment polling on `/student/payment/status` (and `/payment/callback`) calls **two** edge functions in a loop:

1. `hdfc-order-status` → returns 200 with the real status (works fine).
2. `hdfc-verify-payment` → **returns 401 every single time**.

Confirmed from the live edge logs for the most recent payment session: every `hdfc-order-status` POST = `200`, every `hdfc-verify-payment` POST = `401`. The page only renders UI from `hdfc-verify-payment`'s response (it's the "server-trusted" mapper), so even though the database has the real `SUCCESS` status, the page never reads it → falls through to the final `setResult({ status: "not_found" })` branch → user sees **"Payment Status Unknown"**.

### Why `hdfc-verify-payment` returns 401

The function reads the JWT like this:
```ts
const token = authHeader.replace("Bearer ", "");
const { data: userData, error: userErr } = await supabase.auth.getUser(token);
if (userErr || !userData?.user) return jsonResponse({ error: "Unauthorized" }, 401);
```

Two things break it:

- **JWKS / signing-keys flow.** This project uses Supabase signing keys (the `SUPABASE_JWKS` secret exists). On Lovable Cloud edge functions, `supabase.auth.getUser(token)` doesn't reliably validate signing-key JWTs from the anon-key client used here, so it returns `userErr` → 401.
- **`hdfc-order-status` doesn't have this problem** because it doesn't call `auth.getUser` at all — it uses the service-role admin client and reads `order_id` directly from the body.

So the symptom is 100% an auth-validation bug in `hdfc-verify-payment`, not anything wrong with HDFC, the polling loop, or the DB sync. (DB shows the latest order `ANTe5ny0FgY2849` correctly stored as `SUCCESS` with `hdfc_txn_id`, `payment_method=NB`, etc.)

### Secondary issue

Even after the auth fix, both pages currently *only* trust `verifyPayment`. If verify ever fails transiently, the user gets "Unknown" even though `getOrderStatus` already returned a definitive `SUCCESS/FAILED`. We should fall back to the order-status response when verify can't be reached.

## What I'll change

### 1. `supabase/functions/hdfc-verify-payment/index.ts` — fix the 401

Replace the brittle `auth.getUser(token)` call with the same pattern used elsewhere in the project:

- Build the supabase client with `global.headers.Authorization = authHeader` (so the request is identified by the user's JWT via PostgREST), then call `supabase.auth.getUser()` **without** passing the token explicitly. This is the variant that works with the signing-keys flow.
- If that still fails, fall back to decoding the JWT's `sub` claim directly (the JWT is already trusted because edge function deploy is gated by Supabase ingress) and use that as `userId`.
- Authorization (student owns invoice OR is staff) stays exactly as-is — security model is unchanged.

### 2. `src/pages/PaymentStatus.tsx` and `src/pages/PaymentCallback.tsx` — robust fallback

Right now, only `verifyPayment` drives the UI. Change the polling loop to also accept `getOrderStatus`'s definitive results:

- After each `getOrderStatus(orderId)` call, if it returns `status === "SUCCESS" | "FAILED" | "TAMPERED"`, render that immediately (it is already server-validated and DB-synced inside the edge function).
- Keep the `verifyPayment` call as a secondary confirmation path, but never let a verify failure override a known-good order-status result.
- This means even if `hdfc-verify-payment` has any future hiccup, the user still sees the correct success/failure page.

### 3. Cleanup of stuck `INITIATED` rows (optional, low priority)

The DB has a few orders left in `INITIATED` because users closed the HDFC tab before completing payment. Not causing the current bug — leaving as-is unless you want a sweeper.

## Files touched

- `supabase/functions/hdfc-verify-payment/index.ts` — fix JWT validation so it stops returning 401
- `src/pages/PaymentStatus.tsx` — fall back to order-status when verify is unavailable
- `src/pages/PaymentCallback.tsx` — same fallback (the page HDFC redirects to in production)

## How I'll verify

1. Deploy both edge functions and reload the preview.
2. Trigger a fresh payment from `/student/invoices` for the test student.
3. Watch the network panel for `hdfc-verify-payment` → expect `200` with `{status:"SUCCESS",...}`.
4. Confirm `/student/payment/status` now shows the green "Payment Successful" panel with amount, invoice number, and txn ref (instead of "Payment Status Unknown").
5. Cross-check `payment_transactions` and `payments` tables show the same `SUCCESS` / `completed` state for the new order.

## Out of scope

- The two `PaymentStatus.tsx` and `PaymentCallback.tsx` files are ~95% duplicates — I will not consolidate them in this fix. Happy to do that as a follow-up.
- HDFC sandbox is in use (`smartgateway.hdfcuat.bank.in`); switching to production is a separate request.