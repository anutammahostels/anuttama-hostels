# HDFC Order Status — Raw Log Export for Production Audit

HDFC's PG Helpdesk needs raw Order Status API request/response logs in the exact shape of their sample (top-level `order_id`, `status`, `txn_id`, `payment_links`, `udf1..10`, full `card` block, etc.) to clear the production security audit. Our current `payment_logs.response_payload` already stores the parsed HDFC body, but it's wrapped as `{ http, body: {...} }`, which is why HDFC said "logs are incorrect".

This plan makes two changes:

1. Store the HDFC Order Status response **verbatim** going forward.
2. Add a one-click **Export Raw HDFC Logs** action (per order + bulk) that produces a JSON file matching HDFC's sample format, ready to email back to PG Helpdesk.

## What we'll build

### 1. Fix log shape in `hdfc-order-status`
- `response_payload` for `log_type='status_api'` becomes the **raw HDFC JSON** (no `{http, body}` wrapper).
- `request_payload` becomes the exact upstream request envelope: `{ method, url, headers (auth masked), query, customer_id }`.
- Same treatment for `hdfc-create-session`, `hdfc-webhook`, `hdfc-refund` so every HDFC interaction is auditable in raw form.
- Add `log_type` values: `order_create`, `status_api`, `webhook`, `refund` (already partially present).

### 2. Admin "Payment Audit Logs" page (Super Admin)
Route: `/super-admin/payment-logs`

- Searchable table of `payment_logs` joined with `payment_transactions` (order_id, invoice number, student, amount, status, last log timestamp).
- Filters: date range, order_id, log type, status.
- Per-row actions:
  - **View raw JSON** (modal with pretty-printed request + response).
  - **Download `<order_id>.json`** — single file containing the latest `status_api` response in HDFC's exact format.
- Bulk action: **Export selected as ZIP** — one `<order_id>.json` per order, plus a `manifest.csv` (order_id, status, amount, date) for HDFC.

### 3. Edge function `hdfc-export-logs`
- Input: `{ order_ids?: string[], from?: ISO, to?: ISO }`.
- Super-admin only (verify role via JWT).
- Returns a signed-zip stream (or base64 zip) of raw `status_api` response payloads.
- Used by the bulk export button.

### 4. Production-readiness hardening (audit asks)
- Mask `Authorization` header before persisting in `request_payload`.
- Add index `payment_logs(order_id, log_type, created_at desc)` for fast lookups.
- Retention note in README: payment_logs kept indefinitely for audit.

## Technical details

```text
payment_logs row (new shape)
├─ log_type: 'status_api'
├─ order_id:  <merchant order_id>
├─ request_payload:
│    { method: 'GET',
│      url: '<BASE_URL>/orders/<order_id>',
│      headers: { Authorization: 'Basic ***', version, x-merchantid, x-customerid, x-resellerid },
│      customer_id }
└─ response_payload:  <verbatim HDFC JSON, exactly like sample>
```

Files to add/edit:
- `supabase/functions/hdfc-order-status/index.ts` — change `logPayment` calls to pass raw `data` and the masked request envelope.
- `supabase/functions/hdfc-create-session/index.ts`, `hdfc-webhook/index.ts`, `hdfc-refund/index.ts` — same masking + raw-body persistence.
- `supabase/functions/hdfc-export-logs/index.ts` — new, role-gated, returns ZIP.
- `supabase/migrations/<ts>_payment_logs_index.sql` — index only, no schema break.
- `src/pages/superadmin/SuperAdminPaymentLogs.tsx` — new page (table + filters + view/download/bulk export).
- `src/components/superadmin/SuperAdminSidebar.tsx` — add "Payment Audit Logs" link.
- `src/App.tsx` — register route.

Backwards compatibility: existing rows aren't migrated; the UI handles both legacy `{http, body}` and new raw shapes when rendering.

## Out of scope
- No changes to payment flow, reconciliation, or tamper checks.
- No changes to invoice/accounting logic.
