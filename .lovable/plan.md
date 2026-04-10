

## Fix "Payment Status Unknown" After Successful Payment

### Root Cause Analysis

I found **three cascading issues** causing the problem:

1. **`hdfc-order-status` edge function is never called** — zero logs exist for this function. It's either not deployed or the invocation is silently failing. The `catch {}` block in `PaymentStatus.tsx` (line 51) swallows all errors with no logging.

2. **DB polling finds no updated record** — Since the order-status function never runs, the payment in the database stays at `status: pending` forever. All 5 recent payment records in the database are stuck at `pending`.

3. **Payment route is behind auth** — The `/student/payment/status` route requires the `student` role via `ProtectedRoute`. When HDFC redirects from the sandbox gateway to `hostylia.com`, if the user's session expired or they're not logged in on that domain, they'd be redirected to login and lose the `order_id` query parameter entirely.

### Plan

#### 1. Move PaymentStatus outside ProtectedRoute
**File:** `src/App.tsx`
- Move the `/student/payment/status` route outside the protected student layout so the page can always load after HDFC redirect, even if the session is stale. The page only calls the edge function with the order_id — no user-specific data is needed.

#### 2. Deploy `hdfc-order-status` edge function
- Use the deploy tool to ensure the function is actually deployed and callable.

#### 3. Add error visibility to PaymentStatus polling
**File:** `src/pages/PaymentStatus.tsx`
- Replace the silent `catch {}` with `catch (err) { console.error("order status check failed:", err); }` so failures are visible.
- Add the `order_id` to the return URL in the create-session flow as a fallback.

#### 4. Make the polling more resilient
**File:** `src/pages/PaymentStatus.tsx`
- If `getOrderStatus` throws, still continue polling (current behavior) but log the error.
- On the DB polling fallback, also check for `status = 'pending'` and keep polling instead of treating it as "not found" only after max attempts.

### Technical Details

The key fix is deploying the edge function and removing the auth barrier. The edge function itself doesn't require user auth (it queries HDFC directly with the merchant API key), so the page doesn't need to be behind a protected route.

