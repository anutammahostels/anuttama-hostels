

## HDFC Production Security Hardening Plan

This adds defense-in-depth security layers on top of the existing payment flow without breaking it. Existing `payments` table stays the system of record; we add two new tables (`payment_transactions`, `payment_logs`) for HDFC audit/compliance.

### 1. Database Migration (new tables)

**`payment_transactions`** — server-side source-of-truth for HDFC verification
- `order_id TEXT UNIQUE NOT NULL` (≤21 chars, alphanumeric)
- `payment_id UUID` (link to existing `payments.id`)
- `invoice_id UUID`, `customer_id TEXT NOT NULL`
- `amount NUMERIC(10,2) NOT NULL`, `currency TEXT DEFAULT 'INR'`
- `status TEXT DEFAULT 'INITIATED'` — `INITIATED | PENDING | SUCCESS | FAILED | TAMPERED`
- `hdfc_txn_id TEXT`, `payment_method TEXT`
- `created_at`, `updated_at`
- RLS: admins manage; students can SELECT their own (via payment→student join); service role bypasses

**`payment_logs`** — full HDFC request/response audit trail
- `id UUID`, `order_id TEXT NOT NULL`
- `log_type TEXT NOT NULL` — `session_create | callback | status_api | webhook | refund | verify`
- `request_payload JSONB`, `response_payload JSONB`
- `created_at TIMESTAMPTZ`
- RLS: admins SELECT only; service role inserts

Note: The user-supplied schema references `bookings(id)` which doesn't exist in this project — we use `invoice_id` instead (that's our equivalent).

### 2. Edge Function: `hdfc-create-session` (hardened)

- **New order ID**: `ANT` + 8 random alphanumeric chars + last 4 digits of `Date.now()` → ~15 chars, alphanumeric only. Loop with uniqueness check against `payment_transactions.order_id` (max 5 retries).
- **Server-side amount**: ignore client-supplied `amount`; compute `balance = invoice.total_amount - invoice.paid_amount` from DB.
- **customer_id**: derived from `auth.uid()` (sanitized, no hardcoding).
- **Remove `udf2`**: confirm not present (it isn't currently — keep it that way).
- **Insert `payment_transactions` row** with `status='INITIATED'` BEFORE calling HDFC.
- **Log** session request + response into `payment_logs` (`log_type='session_create'`).
- Keep existing `payments` row creation for backward compatibility with the rest of the app.

### 3. Edge Function: `hdfc-order-status` (hardened verification)

- After fetching HDFC status, **independently compare** `order_id` and `amount` from HDFC response vs the stored `payment_transactions` row.
- If both match and HDFC says CHARGED → update `payment_transactions.status='SUCCESS'`.
- If mismatch → set `status='TAMPERED'`, do NOT mark the linked `payments` row as completed, return `{ status: 'TAMPERED' }`.
- **Idempotency**: if `payment_transactions.status` is already `SUCCESS`, skip update and return existing result (replay-attack safe).
- Log every status check into `payment_logs` (`log_type='status_api'`), including TAMPERED and FAILED.
- Keep existing accounting/notification side-effects, gated on the new verified-success path.

### 4. New Edge Function: `hdfc-verify-payment`

Used by the success/failure pages to fetch a server-trusted view (so the URL can't fake success).

- Input: `{ order_id }`
- Auth: requires user JWT (student must own the linked invoice, or staff).
- Reads `payment_transactions` (NOT URL params) and returns:
  ```
  { status, order_id, amount, currency, hdfc_txn_id, invoice_number }
  ```
- If row missing or status ≠ SUCCESS, returns the actual status — frontend renders failure UI.

### 5. Edge Function: `hdfc-payment-callback` (hardened)

- On callback, do not trust the POSTed status. Call `hdfc-order-status` internally (server-to-server) to re-verify.
- Apply the tamper check + idempotency described in step 3.
- Log callback payload into `payment_logs` (`log_type='callback'`).

### 6. Edge Function: `hdfc-webhook` (audit logging)

- Add `payment_logs` insert (`log_type='webhook'`) for every event. No flow changes — webhook already enforces server-side updates.

### 7. Frontend changes

**`src/pages/PaymentStatus.tsx`** and **`src/pages/PaymentCallback.tsx`**:
- Replace direct `getOrderStatus` polling result with a **post-poll call to `hdfc-verify-payment`**. That verified response is the ONLY source for the success UI's Order ID, Amount, Status.
- If `hdfc-verify-payment` returns anything other than `SUCCESS`, render Failed/Processing/Unknown — never trust URL params alone for success.
- Keep existing 5s+15×3s HDFC polling and DB fallback (drives status transitions); render UI only from verified response.
- Display the three required fields on success: **Order ID, Amount (INR), Status**.

**`src/lib/hdfc.ts`**:
- Drop the `amount` argument from `createPaymentSession` (server computes it). Update the only caller `src/pages/student/StudentInvoices.tsx`.
- Add `verifyPayment(orderId)` helper.

### 8. Environment switching

Already implemented (`HDFC_ENVIRONMENT` + `HDFC_BASE_URL_SANDBOX` / `HDFC_BASE_URL_PRODUCTION`). No change needed; staying on `sandbox`.

### Files Touched

- New migration: `payment_transactions`, `payment_logs` tables + RLS
- New edge function: `supabase/functions/hdfc-verify-payment/index.ts`
- Modified edge functions: `hdfc-create-session`, `hdfc-order-status`, `hdfc-payment-callback`, `hdfc-webhook`
- Modified frontend: `src/lib/hdfc.ts`, `src/pages/student/StudentInvoices.tsx`, `src/pages/PaymentStatus.tsx`, `src/pages/PaymentCallback.tsx`
- `supabase/config.toml`: add `[functions.hdfc-verify-payment]` block (`verify_jwt = false`, in-code JWT validation)

### What Stays the Same

- Existing `payments` / `invoices` tables and the rest of the app continue to work unchanged.
- The two-phase polling and 5-second auto-redirect behavior is preserved.
- HDFC `/session` and `/orders/{id}` API contract is unchanged.

