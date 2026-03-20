

## Comprehensive Accounting & Student Fee Payment System

### Overview

Enhance the existing Billing and Accounting pages, and add payment collection from the student portal with invoice PDF download.

### Changes

#### 1. Student Invoices Page — Payment & Download (`src/pages/student/StudentInvoices.tsx`)
- Add **"Pay Now"** button on each unpaid invoice (placeholder — shows a payment dialog with amount, payment method selector: UPI/Bank Transfer/Card/Cash, and a "Collect Payment" button that records payment via the existing `invoices` table update logic)
- Add **"Download Invoice"** button on each invoice that generates a professional PDF invoice in a print window (hostel name, student details, billing breakdown, payment status)
- Show a payment confirmation after recording (updates `paid_amount`, `payment_method`, `payment_date`, `status` on the invoice)
- Add a summary banner at top showing "Pay All Dues" quick action

#### 2. Admin Billing Page Enhancement (`src/pages/Billing.tsx`)
- Add **"Collect Payment"** field visible on each invoice row (currently only in dropdown menu — make it more prominent)
- Add **"Download PDF"** action that actually generates a professional invoice PDF (currently the dropdown item does nothing)
- Add a **"Payment History"** tab showing all recorded payments with date, method, amount, and invoice reference
- Wire up the **"Export"** button to actually export invoices as CSV

#### 3. Accounting Page Enhancement (`src/pages/Accounting.tsx`)  
- Add a **"Fee Collections"** tab that auto-pulls invoice payment data as income transactions (read-only view linking billing to accounting)
- Add **"Profit & Loss"** summary card showing income categories vs expense categories
- Wire up the **"Download Report"** button more prominently in the header area

#### 4. Database — Add `payments` table (migration)
New `payments` table to track individual payment transactions separately from invoice updates:
- `id`, `invoice_id` (ref invoices), `student_id` (ref students), `property_id`
- `amount`, `payment_method`, `transaction_id` (for future gateway), `gateway_response` (jsonb, for future)
- `status` (completed/pending/failed — for future gateway), `paid_at`, `created_at`
- `recorded_by` (uuid — admin who recorded, or null if student self-pay)
- RLS: Admins manage all, students can view own, students can insert own payments

#### 5. Update `useInvoices` hook
- Add payment recording that also inserts into the new `payments` table alongside updating the invoice
- This creates a proper payment audit trail

### Technical Details

- **Student self-payment**: Student clicks "Pay Now" → selects method → confirms amount → inserts into `payments` table + updates invoice `paid_amount`/`status`. The payment method field is a placeholder for future gateway integration.
- **Invoice PDF**: Uses `window.open` + styled HTML template with hostel branding, student details, line-item breakdown, payment status, and a "This is a computer-generated invoice" footer.
- **CSV Export**: Converts filtered invoices to CSV and triggers browser download.
- **Payments table** gives a clean audit trail separate from invoice status changes.

### Files to Create/Edit

1. **New migration** — Create `payments` table with RLS
2. **`src/pages/student/StudentInvoices.tsx`** — Add Pay Now dialog, Download Invoice PDF, payment recording
3. **`src/pages/Billing.tsx`** — Add Download PDF functionality, CSV export, payment history tab
4. **`src/pages/Accounting.tsx`** — Add Fee Collections tab pulling from payments
5. **`src/hooks/useInvoices.ts`** — Update `recordPayment` to also insert into `payments` table

