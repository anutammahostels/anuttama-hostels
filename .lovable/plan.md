

## Add Financial & Extended Fields to Manual Student Creation

### Problem
The "Add Student" dialog only collects basic info (name, enrollment, contact, academic details). The bulk upload sends additional fields like **Final Fee, Allotted Room, Remarks, Account Number, Payment Date, Amount 1/2, Payment Mode 1/2, Transaction Details, and Balance Payment** — all of which the `create-student` backend function already supports. The manual form needs these fields so it can also auto-generate invoices and payment records.

### Changes

**File: `src/pages/Students.tsx`**

1. **Expand the `form` state** — Add missing fields: `final_fee`, `alloted_room_no`, `remarks`, `account_number`, `payment_date`, `amount_1`, `payment_mode_1`, `transaction_details_1`, `amount_2`, `payment_mode_2`, `transaction_details_2`, `balance_payment`. Update `resetForm` accordingly.

2. **Add form fields to the dialog** — After the existing fields (Blood Group), add a new "Financial & Housing Details" section with:
   - Final Fee (number input)
   - Allotted Room No (text)
   - Account Number (text)
   - Payment Date (date)
   - Remarks (text)
   - Amount 1, Payment Mode 1, Transaction Details 1
   - Amount 2, Payment Mode 2, Transaction Details 2
   - Balance Payment (text)

3. **No backend changes needed** — The `create-student` edge function already accepts and processes all these fields, auto-generating invoices and payment records when `final_fee > 0`.

### Technical Details
- The form state grows from 12 fields to ~24 fields
- All new fields are optional — only Student Name and Enrollment Number remain required
- The financial section will be visually separated with a heading/separator
- When Final Fee is entered, the backend will auto-create an invoice and up to 2 payment records, exactly like bulk upload

