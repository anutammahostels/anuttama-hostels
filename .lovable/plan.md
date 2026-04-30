## HDFC Bank Testing Submission Package

Goal: produce everything HDFC needs to verify the integration and move the merchant account (SG4845, ANUTTAMA ENTERPRISES LLP) to the live environment.

### Deliverables

**1. Order Status API logs export** (PDF + Excel)
- Pull recent `payment_logs` rows where `log_type` includes order-status / verify calls plus their request/response payloads.
- Pull matching `payment_transactions` rows (order_id, hdfc_txn_id, status, amount, customer_id, payment_method, timestamps).
- Generate two files in `/mnt/documents/`:
  - `hdfc-order-status-logs.xlsx` — sheets: Transactions, OrderStatus_Requests, OrderStatus_Responses
  - `hdfc-order-status-logs.pdf` — formatted log report with sample SUCCESS, FAILED, and PENDING transactions, including full JSON payloads
- QA each PDF page visually before delivery.

**2. PaymentStatus.tsx UI audit**
- Read `src/pages/PaymentStatus.tsx` and `src/components/student/PaymentOrderDetails.tsx`.
- Confirm the success page visibly shows: Order ID, Amount, Currency, Status (SUCCESS message), Invoice number, HDFC transaction ID, payment method.
- If anything is missing, list precise edits (component + lines) needed so HDFC testers see all required fields. No code changes happen during plan mode — they will be applied after approval if needed.

**3. Drafted email reply to HDFC**
- A ready-to-send reply filling every field in their template:
  - Merchant name, Account ID (SG4845)
  - Website URL: https://anuttamahostels.com (publicly accessible: Yes)
  - Test login credentials (a tester student account — you'll need to provide or I'll create one)
  - Response/Return URL: production callback endpoint
  - Webhook URL
  - Programming language / stack (React + Vite frontend, Deno edge functions on Lovable Cloud)
  - Confirmation that Order Status API is called server-to-server
  - Confirmation that all transaction states (SUCCESS / FAILED / PENDING / TAMPERED) are stored
  - Multiple test amount values
  - Note that mobile SDK is N/A (web-only)
- Saved as `/mnt/documents/hdfc-bank-testing-reply.pdf` and shown inline so you can copy-paste into email.

### Technical notes

- Logs come from `payment_logs` (request_payload, response_payload, log_type, order_id) joined to `payment_transactions` on order_id.
- Use Python (pandas + openpyxl for Excel, reportlab for PDF). JSON payloads pretty-printed with monospace font in PDF.
- Need a tester credential for HDFC. Options:
  - You provide an existing student Form Number + password, OR
  - I create a dedicated `hdfctester` student account via the create-student edge function (after approval)

### One thing to confirm

Do you want me to **also include a Security Audit reminder** in the email (HDFC noted it's mandatory before going live), and do you want the tester credentials created fresh by me, or will you supply them?
