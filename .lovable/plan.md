

## Plan: Import All Excel Columns & Auto-Create Payment Records from Bulk Upload

### Context
The Excel template has 22 columns. Currently only 9 are mapped. The remaining columns contain **payment/finance data** (FINAL FEE, PAYMENT MODE, AMOUNT 1, AMOUNT 2, transaction details, room allocation, etc.) that need to flow into the billing, receivables, and accounting systems.

### Phase 1: Database Schema Changes (Migration)

Add new columns to the `students` table for fields not currently stored:
- `payment_date` (text) — DATE OF THE PAYMENT
- `account_number` (text) — ACCOUNT NUMBER  
- `alloted_room_no` (text) — ALLOTED ROOM NO (display-only, not linked to beds table)
- `remarks` (text) — REMARKS
- `final_fee` (numeric, default 0) — FINAL FEE (total fee the student must pay)

**Why on `students`?** `final_fee` is a per-student annual amount specific to their enrollment, not a monthly recurring charge. `alloted_room_no` and `remarks` are Excel-sourced metadata.

Add new columns to the `payments` table to capture richer transaction detail:
- `payment_mode_label` (text) — original payment mode text from Excel (RTGS, CHEQUE, UPI, CASH, NEFT, IMPS, etc.)
- `transaction_reference` (text) — TRANSACTION DETAILS (cheque no, UTR, etc.)
- `payment_label` (text) — "Amount 1", "Amount 2" to distinguish installments

### Phase 2: Update Edge Function (`create-student`)

Accept the new fields from the request body:
- `payment_date`, `final_fee`, `account_number`, `alloted_room_no`, `remarks`
- `payment_mode_1`, `amount_1`, `transaction_details_1` (first installment)
- `payment_mode_2`, `amount_2`, `transaction_details_2` (second installment)
- `balance_payment` (BALANCE PAYMENT DATE/AMT text)

After creating the student record:
1. If `final_fee > 0`, auto-create an **invoice** for the student:
   - `total_amount` = `final_fee`
   - `paid_amount` = `amount_1 + amount_2`
   - `status` = paid_amount >= total_amount ? "paid" : (paid_amount > 0 ? "partial" : "pending")
   - `billing_month` = payment_date or current date
   - `due_date` = payment_date or current date
   - `notes` = balance_payment text + remarks
2. If `amount_1 > 0`, create a **payment** record linked to the invoice:
   - `amount` = amount_1, `payment_method` = payment_mode_1, `transaction_id` = transaction_details_1
3. If `amount_2 > 0`, create a second **payment** record:
   - `amount` = amount_2, `payment_method` = payment_mode_2, `transaction_id` = transaction_details_2
4. Store `final_fee`, `account_number`, `alloted_room_no`, `remarks` on the student record.

### Phase 3: Update Bulk Upload Mapping (`Students.tsx`)

Map all remaining Excel columns in `handleBulkUpload`:

| Excel Column | Mapped To |
|---|---|
| DATE OF THE PAYMENT | `payment_date` |
| FINAL FEE | `final_fee` |
| PAYMENT MODE-1 | `payment_mode_1` |
| AMOUNT 1 | `amount_1` |
| TRANSCETION DETAILS-1 (first) | `transaction_details_1` |
| PAYMENT MODE-2 | `payment_mode_2` |
| AMOUNT 2 | `amount_2` |
| BALANCE PAYMENT DATE/AMT | `balance_payment` |
| TRANSCETION DETAILS-1 (second, col 18) | `transaction_details_2` |
| ACCOUNT NUMBER | `account_number` |
| ALLOTED ROOM NO | `alloted_room_no` |
| REMARKS | `remarks` |

Parse `amount_1` and `amount_2` to handle comma-formatted numbers (e.g., "1,80,000") and sum expressions (e.g., "90,000 + 21,000").

### Phase 4: Student List Display Updates (`Students.tsx`)

- Show `final_fee` column in the students table
- Show `alloted_room_no` in the room column (as fallback when no bed is assigned)
- Show payment status badge (derived from invoice: paid/partial/pending)

### Phase 5: Billing, Receivables & Accounting Adjustments

**Billing (`Billing.tsx`)**:
- The invoice auto-created during bulk upload already has correct `total_amount` (= final_fee), `paid_amount` (= sum of amounts), and status
- Payment records are already linked, so Payment History tab works automatically
- No structural changes needed — the existing billing page reads invoices and payments as-is

**Receivables (`Receivables.tsx`)**:
- Already uses formula: `Net = Gross - Discounts - Received + Refunds`
- Since invoices are created with correct `total_amount` and `paid_amount`, receivables will automatically show correct outstanding balances
- No code changes needed

**Accounting (`Accounting.tsx`)**:
- P&L already pulls fee collections from invoices. Auto-created invoices with payments will be included automatically
- No code changes needed

### Files Changed

1. **Migration SQL** — add columns to `students` and `payments` tables
2. **`supabase/functions/create-student/index.ts`** — accept new fields, auto-create invoice + payments
3. **`src/pages/Students.tsx`** — map all Excel columns in bulk upload, show new columns in table
4. **`src/hooks/useStudents.ts`** — update `StudentWithProfile` type if needed for new fields

### Execution Order
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 (verify only, no changes expected)

