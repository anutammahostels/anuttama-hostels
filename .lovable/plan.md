## Goal

Make the `hdfc-order-status` Edge Function fully compliant with HDFC SmartGateway's **Order Status API** (`GET /orders/{order_id}`), and propagate the additional details (txn_uuid, gateway info, refunds, payer_vpa, card brand, etc.) up to the client.

## Why changes are needed

The current implementation is functionally working but does **not** match the official spec on three points:

1. **Missing required headers**: spec requires `x-customerid`, `x-resellerid`, and `version`. We currently send only `x-merchantid` + Basic auth. HDFC may reject or rate-limit non-compliant calls in production.
2. **Customer ID lookup**: the call is fired without the customer the order was created for. We already store `customer_id` in `payment_transactions` (set by `hdfc-create-session`) — we just aren't using it on the status call.
3. **Thin response surface**: we only return `status`, `txn_id`, `payment_method`. The spec returns refunds, txn_uuid, gateway, gateway response codes, card metadata, payer VPA, etc. — useful for the success page, refund flow, and audit.

## Scope of changes

### 1. `supabase/functions/hdfc-order-status/index.ts`

- Read `customer_id` from the existing `payment_transactions` row for this `order_id` (fallback to `MERCHANT_ID + "_anon"` only if absent — keeps the call alive for legacy rows).
- Add the missing HDFC headers to the GET call:
  - `version: 2023-06-30`
  - `x-customerid: <customer_id>`
  - `x-resellerid: <HDFC_RESELLER_ID env, default "hdfc_reseller">`
- Keep Basic auth + `x-merchantid` exactly as today.
- Handle non-200 responses explicitly per spec: 400 → bad request; 401 → access_denied; 500 → upstream error. Log + return a normalized error envelope so the frontend stays predictable.
- Expand the JSON we return to the client to include:
  - `txn_uuid`
  - `gateway` + `gateway_id` + `gateway_reference_id`
  - `payment_gateway_response` (resp_code, rrn, epg_txn_id, auth_id_code, resp_message)
  - `card` summary (brand, type, issuer, last_four_digits) when present
  - `payer_vpa` for UPI
  - `refunds[]` (id, amount, status, ref, created)
- Persist the new useful fields onto `payment_transactions` when conclusive: `hdfc_txn_id` (already done), plus `gateway_response` JSON snapshot already captured via `payments.gateway_response`. No schema change needed — existing `payment_logs.response_payload` JSON already holds the full body.
- Keep the existing tamper check, idempotency short-circuit, accounting entries, and student notification logic untouched.

### 2. `src/lib/hdfc.ts`

Extend the `getOrderStatus` return type to include the new fields (all optional) so callers can read them without `as any`:

```ts
txn_uuid?: string | null;
gateway?: string | null;
gateway_id?: number | null;
gateway_reference_id?: string | null;
payment_gateway_response?: {
  resp_code?: string; rrn?: string; epg_txn_id?: string;
  auth_id_code?: string; resp_message?: string;
} | null;
card?: {
  card_brand?: string; card_type?: string;
  card_issuer?: string; last_four_digits?: string;
} | null;
payer_vpa?: string | null;
refunds?: Array<{
  id: string; amount: number; status: string;
  ref?: string; created?: string;
}>;
```

No change to function signature — purely additive.

### 3. `src/pages/PaymentStatus.tsx`

No behavioural change required (we already trust `verifyPayment` for UI). We will just surface one extra friendly line on the success card when `transactionRef` is missing but `txn_uuid` is available — fallback display only. Tiny, no layout shift.

## Out of scope

- No DB migration. Existing tables (`payment_transactions`, `payment_logs`, `payments`) already capture everything needed.
- No change to `hdfc-create-session`, webhook, refund, or callback functions.
- No change to env vars (`HDFC_RESELLER_ID` is already present in secrets).

## Technical notes

- The HDFC `version` header is documented as `2023-06-30` in the curl sample; we'll send the same value.
- `x-customerid` will be the same `customer_id` we send during session creation (auth user's UID), guaranteeing consistency.
- Auth header stays `Basic base64(API_KEY + ":")` — matches the spec's "API key + colon" Basic Auth pattern used for the session API.
- After editing, the function will be auto-deployed by the platform; we'll confirm with a curl ping against an existing order id.

## Acceptance

- A `getOrderStatus(orderId)` call returns the new fields populated for any CHARGED order (verified against logs).
- Server logs show the GET request includes `version`, `x-customerid`, `x-resellerid` headers.
- Existing success / failed / tampered / processing UI flows on `/payment/status` continue to work unchanged.
- No regressions in the webhook-driven path (the webhook already writes to the same tables).
