

## Fix: Payment Status Auto-Redirect + Proper Status Pages

### Problem
After successful HDFC payments, the PaymentStatus page shows the result but doesn't auto-redirect. It also may resolve as "not_found" if polling completes before HDFC processes the payment.

### Changes

#### 1. `src/pages/PaymentStatus.tsx` — Add auto-redirect + increase polling resilience
- Add a 5-second countdown auto-redirect (matching PaymentCallback behavior):
  - **SUCCESS** → redirect to `/student/invoices`
  - **FAILED** → redirect to `/student/invoices`
  - **not_found** → redirect to `/student/invoices`
- Increase polling from 6 attempts to 10 attempts (20 seconds total) to give HDFC more time
- Add countdown state and timer effect identical to PaymentCallback

#### 2. `src/pages/PaymentCallback.tsx` — Increase polling attempts
- Increase from 6 to 10 attempts for consistency
- Already has auto-redirect, so only the polling window needs extending

### Technical Details
- 2 files modified, no database or edge function changes
- The auto-redirect countdown starts only after status resolves (not during loading)
- Both pages will behave consistently: show status → countdown 5s → redirect to invoices

