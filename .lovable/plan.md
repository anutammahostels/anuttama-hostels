

## HDFC Payment Status Fix — Stop UNKNOWN After Payment

### Problem
After a student pays on HDFC, the redirect back to the app has no `order_id` in the URL, so the callback/status page can't verify the payment and shows "UNKNOWN".

### Root Cause
The `return_url` sent to HDFC doesn't include `order_id` as a query parameter. HDFC redirects back to a bare URL with no way to identify which order to check.

### Fix — 3 files changed

#### 1. Edge Function: `supabase/functions/hdfc-create-session/index.ts`
- Append `order_id` and `customer_id` as query params to the `return_url` before sending to HDFC
- Change line 148 from `return_url: callbackUrl` to `return_url: callbackUrl + (callbackUrl.includes('?') ? '&' : '?') + 'order_id=' + orderId + '&customer_id=' + customerId`

#### 2. Frontend payment redirect: `src/pages/student/StudentInvoices.tsx`
- Before redirecting via `openPaymentCheckout`, save `order_id` and `customer_id` to `sessionStorage` as fallback
- `sessionStorage.setItem("hdfc_pending_order_id", session.order_id)`

#### 3. Payment Status page: `src/pages/PaymentStatus.tsx`
- Read `order_id` from URL params first, then fall back to `sessionStorage.getItem("hdfc_pending_order_id")`
- Clear sessionStorage keys after successful status check
- This is the page actually used (routed at `/student/payment/status`)

#### 4. Payment Callback page: `src/pages/PaymentCallback.tsx`
- Same sessionStorage fallback for `order_id` (routed at `/payment/callback`)
- Clear sessionStorage after status resolves

### Technical Details
- 4 files modified, no database changes
- The `PaymentStatus.tsx` page at `/student/payment/status` is the primary return target; `PaymentCallback.tsx` at `/payment/callback` is secondary
- sessionStorage survives same-tab redirects, making it a reliable fallback if HDFC strips query params

