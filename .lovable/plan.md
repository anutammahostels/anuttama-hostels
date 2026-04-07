## Plan: HDFC SmartGateway Payment Integration

### Overview

Integrate HDFC SmartGateway into the student payment flow so students can pay invoices online. Gateway payments will auto-sync with the billing and accounting modules.

### Pre-requisites from You

You will need to provide 3 credentials from your HDFC SmartGateway merchant dashboard:

- **HDFC_MERCHANT_ID** — Your merchant identifier
- **HDFC_API_KEY** — API key for server-to-server calls
- **HDFC_SALT_KEY** — Salt/secret used for hash verification

I will prompt you to enter these securely before building the integration.

### What Gets Built

**1. Edge Function: `hdfc-create-order**`

- Student clicks "Pay Now" → frontend calls this function with invoice ID and amount
- Validates the student owns the invoice and amount is correct
- Calls HDFC SmartGateway's Create Order API to generate a payment session
- Inserts a `payments` record with status `pending`
- Returns the session ID / redirect URL to the frontend

**2. Edge Function: `hdfc-payment-callback**`

- Public webhook endpoint (no JWT) that HDFC calls after payment completes
- Verifies the response hash using the salt key to prevent tampering
- Updates `payments.status` to `completed` or `failed`
- Updates `invoices.paid_amount` and `invoices.status` accordingly
- Auto-creates a `transactions` record (income, category: fee_collection) and a `journal_entries` record (debit Bank / credit Fee Income) to keep accounting in sync
- Sends a notification to the student

**3. Payment Status Page (`/payment/status`)**

- Return URL page after HDFC checkout redirect
- Polls payment status and shows success/failure with invoice details
- Links back to the invoices list

**4. Updated Student Pay Now Flow**

- Replace the current local payment dialog in `StudentInvoices.tsx` with a "Pay Online" button
- Calls `hdfc-create-order`, then redirects to HDFC's hosted checkout page
- On return, lands on the payment status page

**5. Admin Visibility**

- Gateway payments appear in the existing Billing payment history with `payment_method: "online"` and the HDFC `transaction_id`
- No changes needed to the admin billing UI — it already renders all payment records

### Files Changed


| File                                                | Action                                                |
| --------------------------------------------------- | ----------------------------------------------------- |
| `supabase/functions/hdfc-create-order/index.ts`     | Create                                                |
| `supabase/functions/hdfc-payment-callback/index.ts` | Create                                                |
| `src/pages/PaymentStatus.tsx`                       | Create                                                |
| `src/pages/student/StudentInvoices.tsx`             | Modify — replace pay dialog with gateway redirect     |
| `src/App.tsx`                                       | Add `/payment/status` route                           |
| `supabase/config.toml`                              | Add `hdfc-payment-callback` with `verify_jwt = false` |


### Execution Order

1. Prompt you to add the 3 HDFC secrets
2. Create both edge functions
3. Create the payment status page and route
4. Update the student invoices pay flow
  Here's the required variables  
  Merchant ID: SG4845  
  API KEY: 5B0EA8495764280808C5597CA58C0B  
  client id: hdfcmaster  
  Prompt: I have read the official docs of the HDFC for implementing this where i got i might need these vars:  
  {
    "MERCHANT_ID":"YOUR_MERCHANT_ID",
    "PRIVATE_KEY_PATH":"privateKey.pem",
    "PUBLIC_KEY_PATH":"public-key.pem",
    "KEY_UUID":"YOUR_KEY_ID",
    "PAYMENT_PAGE_CLIENT_ID": "YOUR_PAYMENY_PAGE_CLIENT_ID"
  }  
  for other var's value read this documentation "[https://smartgateway.hdfcbank.com/docs/hypercheckout-mobile-sdk/web/sample-project-setup/backend-setup](https://smartgateway.hdfcbank.com/docs/hypercheckout-mobile-sdk/web/sample-project-setup/backend-setup)"  
    
  i have attached 3 files in the input which i got from creating JWT keys