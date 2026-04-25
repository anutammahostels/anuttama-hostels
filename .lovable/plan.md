## Audit: Current HDFC integration vs Official Spec

I reviewed the uploaded HDFC SmartGateway API reference against our 3 edge functions (`hdfc-create-session`, `hdfc-order-status`, `hdfc-refund`) and the frontend (`src/lib/hdfc.ts`, `PaymentStatus.tsx`, `PaymentOrderDetails.tsx`).

### What is already correct ✅
- `/session` request: all required fields are sent (`order_id`, `amount`, `customer_id`, `customer_email`, `customer_phone`, `payment_page_client_id`, `action`, `return_url`, `currency`).
- `/orders/{order_id}` GET: sends `version: 2023-06-30`, `x-merchantid`, `x-customerid`, `x-resellerid`.
- Order ID: 15 chars, alphanumeric, non-sequential — within the <21 char rule.
- Status mapping covers `CHARGED`, `NEW`, `PENDING_VBV`, `AUTHORIZATION_FAILED`, `NOT_FOUND`, etc.
- Tamper check on amount + order_id.
- Rich response normalization: `txn_uuid`, `card`, `payer_vpa`, `payment_gateway_response`, `refunds[]`.

### Gaps to fix ❌

**1. Base URL mismatch (HIGH)**
Spec says:
- Sandbox: `https://smartgateway.hdfcuat.bank.in`
- Production: `https://smartgateway.hdfc.bank.in`

Our `hdfc-create-session` and `hdfc-order-status` default fallbacks use `smartgatewayuat.hdfcbank.com` / `smartgateway.hdfcbank.com` (legacy). The actual values come from `HDFC_BASE_URL_SANDBOX` / `HDFC_BASE_URL_PRODUCTION` secrets, but if those ever go missing the fallback hits a wrong host. Update the hardcoded fallbacks to match the spec.

**2. Refund function missing required headers (HIGH)**
Spec requires `x-customerid` and `x-resellerid` on the refund call. Our `hdfc-refund` only sends `Authorization`, `Content-Type`, `x-merchantid`. HDFC will reject this in production. We must:
- Look up `customer_id` from `payment_transactions` for the order.
- Add `x-customerid` and `x-resellerid` headers.
- Log to `payment_logs` (currently no logging — inconsistent with the other functions).
- Surface specific HDFC refund error codes (`duplicate.call`, `invalid.amount.exceeded`, `request.exceeded`, `invalid.order.not_successful`) as user-friendly messages.

**3. Customer email/phone fallbacks are spec-violating (MEDIUM)**
- Phone fallback `"9999999999"` and email fallback `student_<id>@hostylia.com` go through to HDFC. Phone must be 10-digit (OK) but the synthetic email may be flagged. We should:
  - Validate phone is exactly 10 digits (strip `+91`, spaces, dashes).
  - If profile has no valid phone/email, return a 400 telling the user to update their profile rather than sending fake data to the gateway.

**4. Missing optional fields that improve UX (LOW)**
The spec supports `description`, `first_name`, `last_name`, and `udf1..udf10`. We send none. Recommended additions:
- `description: "Hostel fee — invoice <invoice_number>"`
- `first_name` / `last_name` derived from `profile.full_name`.
- `udf1 = invoice_id`, `udf2 = student_id`, `udf3 = property_id` — extremely useful for reconciliation in HDFC dashboard and for webhook lookups.

**5. UI doesn't surface card brand / VPA on the post-payment success screen (LOW)**
`PaymentStatus.tsx` currently shows only `hdfc_txn_id`. The richer `PaymentOrderDetails` panel exists but is only shown on `StudentInvoices`. Add a compact "Payment Method" line on the success card showing `VISA •••• 1234` for cards or `payer_vpa` for UPI, fetched via `getOrderStatus`.

**6. Refund return type & frontend (LOW)**
`initiateRefund` returns untyped data. Add a typed return matching the new fields (`refund_id`, `unique_request_id`, `status`, `amount`, `gateway_error_code` if any).

---

## Proposed Changes

**`supabase/functions/hdfc-create-session/index.ts`**
- Update sandbox/production fallback URLs to spec values.
- Validate `profile.phone` (10 digits) and `profile.email` (basic regex). On failure return `{ error: "Please update your profile with a valid phone and email before paying" }`.
- Add to `sessionPayload`: `description`, `first_name`, `last_name`, `udf1` (invoice_id), `udf2` (student_id), `udf3` (property_id), `udf6` (invoice_number).

**`supabase/functions/hdfc-order-status/index.ts`**
- Update fallback URLs to spec values.

**`supabase/functions/hdfc-refund/index.ts`**
- Look up `payment_transactions` row to get `customer_id`.
- Add `x-customerid` + `x-resellerid` headers.
- Add `payment_logs` entry (`log_type: "refund"`).
- Map HDFC error codes to friendly messages (duplicate, exceeded, not-successful, limit-exceeded).
- Persist refund in `refunds` table on success (currently only returns to client without DB write).

**`src/lib/hdfc.ts`**
- Type `initiateRefund` return value.

**`src/pages/PaymentStatus.tsx`**
- On SUCCESS, lazy-call `getOrderStatus(order_id)` once and display payment method line: `card.card_brand •••• card.last_four_digits` or `UPI: payer_vpa`.

No DB schema changes are needed — `refunds` table already exists with the right columns.

### Out of scope (not requested)
- The webhook function (`hdfc-webhook`) — its existing config is fine for spec compliance of the 3 listed APIs.
- New UI for triggering refunds from the admin panel (refund function exists; admin UI can be added later if you want).

Approve and I'll implement these changes and redeploy the affected edge functions.