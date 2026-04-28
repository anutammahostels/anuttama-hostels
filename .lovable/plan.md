# HDFC Security Audit — Compliance Review & Proof Generation

## Part 1 — Compliance Audit (current state)

### Bank Testing Checklist (Security Audit)

| # | Requirement | Status | Evidence in code |
|---|---|---|---|
| 1 | Unique Order ID generation | PASS | `hdfc-create-session` → `generateUniqueOrderId()` produces `ANT` + 8 random alphanumeric + 4 timestamp chars = **15 chars**, alphanumeric only, non-sequential, with DB uniqueness check (5 retries). |
| 2 | Request Tampering prevention | PASS | Amount is **never** taken from the client. `hdfc-create-session` ignores any client-supplied amount and computes `balance = invoice.total_amount − invoice.paid_amount` directly from the DB before sending to HDFC. |
| 3 | Response Tampering prevention | PASS (with 1 fix) | `hdfc-payment-callback` validates the RSA signature using `HDFC_PUBLIC_KEY`, then **independently re-verifies** the order status server-to-server via `/orders/{id}` before marking the DB. UI never trusts URL params — it reads from `payment_transactions` via `hdfc-verify-payment`. **Fix needed:** strip duplicate `order_id` (HDFC appended `,ANTbt3IfpuH8629` in last test, breaking signature check). |
| 4 | URL redirection validation | PASS | Final state is determined by `hdfc-order-status` (server→HDFC API), not by which URL the user landed on. `success` / `failed` / `processing` UIs all read the same server-verified record. |
| 5 | Duplicate entry validation | PASS | `payment_transactions.order_id` is unique; `hdfc-order-status` short-circuits if status is already `SUCCESS` (idempotent replay-safe). `payments` table is keyed off `order_id` via `transaction_id`. |
| 6 | Receipt Generation | PASS | `StudentInvoices` shows order details + downloadable invoice (`handleDownloadInvoice`) and `PaymentOrderDetails` panel shows amount, order id, txn ref, payment method, RRN. Receipt is generated only when `payment_transactions.status='SUCCESS'`. |
| 7 | Valid SSL | PASS | All custom domains (anuttamahostels.com, hostylia.com) and the Lovable Cloud preview are served over HTTPS via the Lovable/Cloudflare edge. |

### Integration Checklist (HDFC PDF)

| Requirement | Status | Notes |
|---|---|---|
| Unique `customer_id` per customer | PASS | Derived from `auth.uid()` (UUID, hyphens stripped, 30 chars). One-to-one with each user. |
| Don't use `udf2` for extra info | PASS | `udf2` carries the internal `student.id` only (used for reconciliation, not tokenization-blocked content). **Note:** HDFC says UDF2 is *blocked for tokenization*. Since we are not tokenizing cards, this is fine — but to be 100% audit-clean we should move `student_id` to `udf4` and leave `udf2` empty. |
| Order number & amount visible on response page | PASS | Success card shows Order ID, Amount, Status, Invoice #, Payment Method, Txn Ref. |
| Real-time response shows order #, amount, success message | PASS | All four fields rendered on `/student/payment/status` immediately after server verification. |
| Order ID format: <21 chars, no special chars, alphanumeric, non-sequential | PASS | 15 chars, `[A-Za-z0-9]` only, random alphanumeric component. |

### Issues found (2 small fixes needed)

1. **Duplicated `order_id` in callback** — From the last live log: HDFC POSTed `order_id=ANTbt3IfpuH8629,ANTbt3IfpuH8629`. This caused signature verification to fail and the subsequent `/orders/{id}` lookup to return `RESOURCE_NOT_FOUND` (cleared only on retry). Root cause: `hdfc-create-session` puts `order_id` in the `return_url` querystring **and** HDFC also appends it on redirect, producing a comma-joined value. Fix: in `hdfc-payment-callback`, normalize `order_id` by taking the first value if comma-separated; also remove `order_id` from the `return_url` we send to HDFC (HDFC adds it automatically).
2. **UDF hygiene** — Move `student_id` from `udf2` → `udf4` to fully comply with HDFC's "do not use UDF2" rule.

---

## Part 2 — Fixes

**`supabase/functions/hdfc-payment-callback/index.ts`**
- After parsing `data.order_id`, normalize: `orderId = orderId.split(",")[0].trim()`.
- Same normalization for the `signature` and any other potentially duplicated field.

**`supabase/functions/hdfc-create-session/index.ts`**
- Build `enrichedReturnUrl` without `order_id` and `customer_id` query params (HDFC appends them itself). Keep only `app_return_to`.
- Move `udf2: student.id` → `udf4: student.id`; set `udf2: ""`.

Deploy both edge functions.

---

## Part 3 — Generate proof package for HDFC

Produce a single PDF (`/mnt/documents/HDFC_Integration_Proof.pdf`) containing the filled checklist + technical evidence. The PDF will include:

1. **Filled "Bank Testing Checklist"** — all 7 rows marked **Yes** with a one-line justification each and a code/file reference.
2. **Filled "Integration Checklist"** — confirmation of customer_id, UDF usage, receipt fields, order ID format, with a sample order ID generated live.
3. **Live evidence section** — pulled from the database for the 3 most recent successful test transactions:
   - Order ID, Amount, Status, HDFC Txn ID, Payment Method, Created/Updated timestamps.
   - The matching `payment_logs` entries (session_create request, callback received, server re-verify response) showing request/response symmetry.
4. **Code excerpts** — short snippets proving each control:
   - Order ID generator (uniqueness loop).
   - Server-side amount computation (the line that ignores client amount).
   - Signature verification (`crypto.subtle.verify` with `HDFC_PUBLIC_KEY`).
   - Server-to-server re-verification call.
   - Idempotency short-circuit in `hdfc-order-status`.
5. **Architecture diagram (ASCII)** — Browser → HDFC → `hdfc-payment-callback` (signature verify + status re-fetch) → DB → Browser polls `hdfc-verify-payment`.
6. **SSL note** — domains served over HTTPS via Cloudflare/Lovable edge; user can run SSLLABS scan on `anuttamahostels.com` and attach the report.

The PDF will be QA'd page-by-page (rendered to images and visually inspected) before delivery.

---

## What you'll get

- 2 small edge-function fixes (deployed).
- `HDFC_Integration_Proof.pdf` in `/mnt/documents/` ready to send to the HDFC security team along with the screenshots they asked for (success page, failure page, response page — you can capture these from the live flow once the fixes are deployed).

Approve to proceed.