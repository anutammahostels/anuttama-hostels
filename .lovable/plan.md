## Goal
Make the admin "Generate Invoices" flow usable for adding a second (or third) installment-style invoice for an existing student. Strip out the rent/mess/electricity/other/discount inputs, mirror the transaction-detail fields used when adding a student, fix the duplicate invoice number error, and stop pre-selecting students.

## Changes (single file: `src/pages/Billing.tsx`)

### 1. Replace the "Default Charges" section in the Generate Invoices dialog
Remove these inputs and their state:
- Default Room Rent (`defaultRoomRent`)
- Default Mess Charges (`defaultMessCharges`)
- Default Electricity (`defaultElectricity`)
- Default Other Charges (`defaultOtherCharges`)
- Default Discount (`defaultDiscount`)

Add a single "Installment / Transaction Details" section (one row, applied to every selected student) with the same fields used on the Add Student form:

```text
Amount           [number, default 0, required > 0]
Payment Date     [date, defaults to today]
Payment Mode     [Select: Cash, UPI, RTGS, NEFT, Cheque, DD, Online]
Transaction Details   [text, e.g. receipt/ref note]
UTR ID           [text]
Remarks          [text, optional]
```

Keep the existing Billing Month and Due Date inputs.

### 2. Default values
- Amount input default: `"0"` (string, so the field shows 0 not blank).
- Selected students default: `[]` (already the case in state — the issue is "Select All" behavior; see point 4).

### 3. Fix duplicate invoice number error
Current code builds `INV-YYYYMM-XXXX` using `(i + 1 + invoices.length)`, where `invoices` is the *currently loaded, center-filtered* list. Re-running the dialog or generating in a different center collides with previously stored numbers (`invoices_invoice_number_key UNIQUE`).

New scheme — guaranteed unique per call:

```ts
const stamp = Date.now().toString(36).toUpperCase(); // ms since epoch, compact
const rand  = Math.random().toString(36).slice(2, 6).toUpperCase();
const invoiceNumber = `INV-${billingMonth.replace('-', '')}-${stamp}-${rand}-${i + 1}`;
```

This drops dependence on `invoices.length` and guarantees uniqueness across centers, sessions, and repeat generations.

### 4. Don't pre-select students
- Remove any code path that auto-fills `selectedStudentIds` on dialog open.
- Keep the "Select All" toggle as a manual checkbox in the student picker (unchecked by default).
- Verify `setSelectedStudentIds([])` runs on dialog open (already happens in `resetGenerateDialog`, but ensure opening the dialog from a fresh page load also starts empty — initialize `useState<string[]>([])` and never seed it from `activeStudents`).

### 5. Persist the transaction data
In `handleGenerateInvoices`, for each selected student:

1. Insert the invoice with:
   - `room_rent = 0`, `mess_charges = 0`, `electricity_charges = 0`, `other_charges = 0`, `discounts = 0`
   - `total_amount = parseFloat(amount) || 0`
   - `paid_amount = total_amount` (since this row represents a received installment), `status = 'paid'`, `payment_method = <selected mode>`, `payment_date = <selected date>`
   - `invoice_number` from the new scheme above
2. Insert a matching row into `payments` with `amount`, `payment_method`, `status='completed'`, `recorded_by = current user`, and the student's `property_id` (look it up via the bed → room → floor → block chain, same pattern already used in `useInvoices.recordPayment`).
3. Store `transaction_details` + `utr_id` + `remarks` in the invoice `notes`/`remarks` column if one exists, otherwise append to the `payments` row's `reference`/`notes` column. (We'll confirm which columns exist while implementing and pick the right one — no schema change.)

### 6. Validation
- Require at least one student selected.
- Require `amount > 0`.
- Require `payment_date` and `payment_mode`.
Show toast errors otherwise; do not start the loop.

## Out of scope
- No DB schema changes.
- No changes to the student-facing invoice view, receipt template, or other tabs.
- Single-invoice deletion, refunds, and reminders remain untouched.

## Verification
1. Open Billing → Generate Invoices: the dialog shows only Billing Month, Due Date, Installment fields (Amount/Date/Mode/Txn/UTR/Remarks), and the student picker with **nothing pre-selected**.
2. Pick one student already having an invoice, set Amount = 50000, generate → succeeds, no duplicate-key error, new invoice appears with total 50000 and status Paid.
3. Re-run immediately with the same student and Amount = 25000 → second invoice created successfully.
4. The student's portal shows both invoices.
