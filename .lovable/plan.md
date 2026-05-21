# Align HDFC Order Status with official spec

The `hdfc-order-status` edge function technically works, but it deviates from
the SmartGateway Order Status API contract in a few places, which is why the
entries in `payment_logs` look noisy/incorrect. We bring the request, status
mapping, response normalization, and logging in line with the documented spec.

## What changes

1. **Fix Basic Auth header**
   - Spec: `Authorization: Basic base64(API_KEY)` (no colon).
   - Current: `btoa(API_KEY + ":")` — works on UAT only by accident.
   - Switch to `btoa(API_KEY)`.

2. **Complete `status` → internal status mapping**
   Per the HDFC transaction-status table:
   - `SUCCESS`: `CHARGED`, `AUTO_REFUNDED`, `COD_INITIATED`, `PARTIAL_CHARGED`
   - `PENDING`: `NEW`, `PENDING_VBV`, `AUTHORIZING`, `AUTHORIZED`,
     `CAPTURE_INITIATED`, `VOID_INITIATED`, `STARTED`, `PENDING`
   - `FAILED`: `AUTHENTICATION_FAILED`, `AUTHORIZATION_FAILED`,
     `JUSPAY_DECLINED`, `CAPTURE_FAILED`, `VOID_FAILED`, `VOIDED`,
     `NOT_FOUND`, `DECLINED`, `EXPIRED`
   Anything else stays `UNKNOWN`. Today `AUTHORIZED`, `CAPTURE_INITIATED`,
   `PARTIAL_CHARGED`, `EXPIRED` etc. fall through to `UNKNOWN` and pollute logs.

3. **Normalize response to match documented fields**
   Return (and persist) a structured payload that mirrors the spec:
   - top-level: `order_id`, `status`, `status_id`, `amount`, `currency`,
     `customer_id`, `customer_email`, `customer_phone`, `merchant_id`,
     `date_created`, `txn_id`, `txn_uuid`, `payment_method`,
     `payment_method_type`, `auth_type`, `refunded`, `amount_refunded`,
     `effective_amount`, `gateway_id`, `gateway_reference_id`, `payer_vpa`
   - nested: `txn_detail`, `payment_gateway_response`, `card`, `upi`,
     `refunds[]` (with `id`, `unique_request_id`, `amount`, `status`, `ref`,
     `created`, `refund_type`, `refund_source`, `sent_to_gateway`,
     `initiated_by`, `error_code`, `error_message`)
   This replaces today's flatter shape that drops `status_id`, `effective_amount`,
   `auth_type`, `sent_to_gateway`, etc.

4. **Cleaner `payment_logs` entries**
   - `request_payload` becomes `{ method, url, headers: { x-merchantid,
     x-customerid, x-resellerid, version } }` — no auth secret, but enough
     to debug.
   - `response_payload` becomes `{ http_status, parsed: <normalized>, raw_status,
     raw_status_id }` instead of dumping the whole gateway blob, which is what
     makes today's log look wrong (it currently shows session-creation fields
     like `payment_page_sdk_payload`, `payment_links` etc.).
   - Keep the full raw body only when the HTTP status is non-2xx or JSON parse
     fails (for forensic debugging).

5. **Tamper-check uses normalized fields**
   Compare `data.order_id` and `data.amount` exactly as the spec returns them
   (already correct, but reuses the normalized object now).

No DB schema changes. No frontend changes (the response shape stays
backward-compatible — we add fields, don't remove any consumed by `src/lib/hdfc.ts`).

## Files touched

- `supabase/functions/hdfc-order-status/index.ts`

## Technical notes

- Basic-auth fix is a one-line change at the `btoa(...)` call.
- Status map is implemented as three `Set<string>` constants for clarity.
- Normalization is a single `normalizeOrderStatus(data)` helper so the same
  shape is used in the return value, the tamper check, and the log entry.
- `payment_logs` writes use the new compact shape; the full raw response is
  only written when `!res.ok` or JSON.parse throws.
