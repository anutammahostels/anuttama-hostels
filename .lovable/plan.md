

## Plan: Rewrite HDFC Integration Using Basic Auth (Per Official Guide)

### Problem
The current implementation uses the `/v4/session` endpoint with JWS/JWE encryption, which requires specific key configurations that have been failing. The uploaded guide specifies a **Basic Auth** flow using the simpler `/session` endpoint — no encryption needed. This is the correct approach for your merchant credentials (API Key auth, not JWT auth).

### Phased Implementation

---

**Phase 1 — Set Up Missing Secrets**

Add these new secrets (the guide requires them):
- `HDFC_RESELLER_ID` = `hdfc_reseller`
- `HDFC_ENVIRONMENT` = `sandbox`
- `HDFC_PAYMENT_PAGE_CLIENT_ID` = `hdfcmaster`
- `HDFC_BASE_URL_SANDBOX` = `https://smartgateway.hdfcuat.bank.in`
- `HDFC_BASE_URL_PRODUCTION` = `https://smartgateway.hdfc.bank.in`
- `HDFC_WEBHOOK_USERNAME` = `hostylia_webhook_user`
- `HDFC_WEBHOOK_PASSWORD` = `hostylia_webhook_p@ss2025`

Verify existing `HDFC_API_KEY` = `E029D22EFE24DC8854710F4BD6FECB` and `HDFC_MERCHANT_ID` = `SG4845`.

---

**Phase 2 — Rewrite `hdfc-create-order` → `hdfc-create-session`**

Replace the entire 524-line JWS/JWE implementation with the simple Basic Auth flow from the guide:
- Remove all crypto code (PKCS#1→PKCS#8, JWS signing, JWE encryption, decryption)
- Use `Authorization: Basic ${btoa(API_KEY)}` header
- Call `POST ${BASE_URL}/session` (not `/v4/session`)
- Send plain JSON payload with `order_id`, `amount`, `customer_id`, `customer_email`, `customer_phone`, `payment_page_client_id`, `action: "paymentPage"`, `return_url`
- Keep existing DB logic (auth check, student/invoice lookup, pending payment insert)
- Return `{ payment_url, order_id, status }` to frontend

Create as new function `hdfc-create-session` (rename from `hdfc-create-order`).

---

**Phase 3 — Create `hdfc-order-status` (Mandatory per HDFC)**

New edge function: `supabase/functions/hdfc-order-status/index.ts`
- `GET ${BASE_URL}/orders/${order_id}` with Basic Auth
- Maps HDFC statuses to `SUCCESS` / `PENDING` / `FAILED` / `UNKNOWN`
- Returns order details (amount, txn_id, payment method, refund info)

---

**Phase 4 — Create `hdfc-webhook`**

New edge function: `supabase/functions/hdfc-webhook/index.ts`
- Authenticates via Basic Auth using `HDFC_WEBHOOK_USERNAME`/`HDFC_WEBHOOK_PASSWORD`
- Handles events: `ORDER_SUCCEEDED`, `ORDER_FAILED`, `TXN_CHARGED`, `TXN_FAILED`, `REFUND_INITIATED`, `REFUND_SUCCEEDED`
- Updates payment records, invoice status, creates accounting entries
- Always returns HTTP 200 (HDFC retries on non-200)

---

**Phase 5 — Create `hdfc-refund`**

New edge function: `supabase/functions/hdfc-refund/index.ts`
- `POST ${BASE_URL}/orders/${order_id}/refunds` with `application/x-www-form-urlencoded`
- Requires `unique_request_id` (max 21 chars)
- Only works on `CHARGED` orders

---

**Phase 6 — Frontend Updates**

1. **`src/lib/hdfc.ts`** — New helper module with typed functions: `createPaymentSession()`, `getOrderStatus()`, `initiateRefund()`, `generateOrderId()`

2. **`src/pages/student/StudentInvoices.tsx`** — Update `handlePayOnline` to:
   - Call `hdfc-create-session` instead of `hdfc-create-order`
   - Use simpler response shape (`data.payment_url`)

3. **`src/pages/PaymentStatus.tsx`** — Update to call `hdfc-order-status` for server-side verification instead of just polling the DB

4. **`src/pages/PaymentCallback.tsx`** — New page at `/payment/callback` as HDFC return URL, calls Order Status API for verification

5. **`src/App.tsx`** — Add route for `/payment/callback`

---

**Phase 7 — Config & Deploy**

- Update `supabase/config.toml` with new function entries (`verify_jwt = false` for webhook and callback)
- Deploy all edge functions
- Test end-to-end with sandbox card `4111 1111 1111 1111`

### Files Changed

| File | Action |
|---|---|
| `supabase/functions/hdfc-create-session/index.ts` | Create (replaces hdfc-create-order) |
| `supabase/functions/hdfc-order-status/index.ts` | Create |
| `supabase/functions/hdfc-webhook/index.ts` | Create |
| `supabase/functions/hdfc-refund/index.ts` | Create |
| `src/lib/hdfc.ts` | Create |
| `src/pages/PaymentCallback.tsx` | Create |
| `src/pages/student/StudentInvoices.tsx` | Update payment handler |
| `src/pages/PaymentStatus.tsx` | Update to use Order Status API |
| `src/App.tsx` | Add `/payment/callback` route |
| `supabase/config.toml` | Add new function configs |

