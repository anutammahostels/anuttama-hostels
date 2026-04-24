## 26-Column Bulk Upload + Manual Form Hardening

Bring the entire student creation pipeline (downloadable template, bulk Excel upload, manual "Add Student" dialog, and the `create-student` Edge Function) to parity with the canonical Anuttama 26-column format — supporting **3 payment installments** and **separate UTR IDs** per installment.

> Spelling note: the user's source Excel uses the misspelling **"TRANSCETION"**. In all our generated templates, UI labels, code identifiers, and DB writes we will use the correct spelling **"TRANSACTION"**. The bulk-upload parser will still accept BOTH spellings as input headers so existing files admins have saved continue to import cleanly.

---

### 1. Template Download — `downloadTemplate()` in `src/pages/Students.tsx`

Replace the current template headers with the 26-column canonical format (correct spelling):

```
S.NO | FORM NO | STUDENT NAME | FATHER NAME | Gender | CONTACT NO1 | CONTACT NO 2 | GRADE | STREAM |
DATE OF THE PAYMENT | FINAL FEE |
PAYMENT MODE-1 | AMOUNT 1 | TRANSACTION DETAILS-1 | UTR ID |
DATE OF THE PAYMENT (2nd) | PAYMENT MODE-2 | AMOUNT 2 | BALANCE PAYMENT DATE | TRANSACTION DETAILS-2 | UTR ID-2 |
PAYMENT MODE-3 | AMOUNT 3 | BALANCE PAYMENT DATE (3rd) | TRANSACTION DETAILS-3 | UTR ID-3
```

Drop legacy template-only columns (`ACCOUNT NUMBER`, `ALLOTED ROOM NO`, `REMARKS`) since the canonical format does not include them.

Add a sample row demonstrating Indian comma parsing (`1,80,000`) and sum expression (`90,000 + 21,000`).

---

### 2. Bulk Upload Parser — `src/pages/Students.tsx`

Update the header normalization + mapping logic:

- **Index-based lookup for duplicate-named columns**: `UTR ID` / `UTR ID-2` / `UTR ID-3` and `DATE OF THE PAYMENT` / `DATE OF THE PAYMENT (2nd)` / `BALANCE PAYMENT DATE` / `BALANCE PAYMENT DATE (3rd)` must each be picked up by their position, not by name match alone — using the same `txnKeys` ordering pattern already in the file.
- **Accept both spellings**: header normalization treats `transcetion` and `transaction` as the same token so older Excel files still parse.
- New parsed fields per row sent to the edge function:
  - `payment_date_1`, `payment_date_2`, `payment_date_3`
  - `payment_mode_1/2/3`, `amount_1/2/3`
  - `transaction_details_1/2/3`
  - `utr_id_1/2/3`
- Preserve existing helpers: header auto-detection (scan first 20 rows), `parseIndianNumber()` (commas + sum expressions), Excel-serial-date conversion.

---

### 3. Manual "Add Student" Dialog — `src/pages/Students.tsx`

Extend the form schema and JSX to add a third installment block + UTR fields:

- **Installment 1**: payment_date_1, payment_mode_1, amount_1, transaction_details_1, **utr_id_1** (new)
- **Installment 2**: payment_date_2, payment_mode_2, amount_2, transaction_details_2, **utr_id_2** (new)
- **Installment 3 (new entire block)**: payment_date_3, payment_mode_3, amount_3, transaction_details_3, utr_id_3
- Live-running paid-total + balance display already exists for installments 1 & 2 — extend to include installment 3.
- Each installment block remains optional (skip if amount is empty/zero).

---

### 4. Edge Function — `supabase/functions/create-student/index.ts`

- Accept the new fields: `payment_date_1/2/3`, `payment_mode_1/2/3`, `amount_1/2/3`, `transaction_details_1/2/3`, `utr_id_1/2/3`.
- Loop over installments 1–3 and insert one row into `payments` per non-zero installment with:
  - `amount` ← `amount_n`
  - `payment_date` ← `payment_date_n` (per-installment date, no longer a single shared date)
  - `payment_mode_label` ← `payment_mode_n`
  - `transaction_id` ← `transaction_details_n`
  - `transaction_reference` ← `utr_id_n` *(currently both fields receive the same value — fix this)*
- Recalculate `invoices.paid_amount = amount_1 + amount_2 + amount_3`.
- Status logic unchanged: `paid` when total ≥ final_fee, else `partial`, else `pending`.

---

### 5. Other Surfaces to Verify (no changes expected, but check)

- **`src/pages/Billing.tsx` / Invoice & Payment list views**: confirm they already render `transaction_reference` (UTR) alongside `transaction_id`. If they display only one, add a small "UTR" column.
- **`useInvoices` / `usePayments` hooks**: no changes — they already select `*`.
- **Receipt PDFs / data exports**: if any export writes "Transaction Details", confirm it doesn't say "Transcetion".

---

### Files Touched

- `src/pages/Students.tsx` — template, parser, manual form
- `supabase/functions/create-student/index.ts` — 3rd installment + UTR mapping + per-installment dates
- (Read-only check) `src/pages/Billing.tsx`, payment/invoice display components

### What Stays the Same

- No DB schema change — `payments` already supports unlimited rows and has both `transaction_id` and `transaction_reference`.
- Existing 2-installment Excel files still upload (parser accepts old + new header spellings, treats missing 3rd installment as optional).
- Auto-invoice generation, login credential generation, and bed assignment logic unchanged.