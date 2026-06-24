# Billing & Payments — Consistency Fix

## Goals (from your answers)

1. **Invoice model unchanged** — `create-student` keeps creating one invoice per installment + one pending "balance" invoice.
2. **Per pending invoice**: max **3 partial payments** allowed (combining online + offline). The 3rd partial payment **must clear the remaining balance** (no 4th).
3. **Receipts**: every successful payment generates a payment receipt; when an invoice becomes fully paid, a consolidated "Paid in Full" invoice receipt is also available.
4. **Admin offline updates**: a global search bar at the top of `Billing` (search by Form Number / name / phone) that filters invoices instantly so admins can record offline payments against the right invoice.

## Root-cause fixes (current bugs)

- `Billing.tsx` bulk-generates invoices and **writes `paid_amount` directly** on the invoice row instead of relying on the payments → reconcile pipeline. This drifts from `reconcileInvoice` (in `hdfc-webhook`). Result: an invoice's `paid_amount` and `status` can disagree with `SUM(payments.amount)`.
- "Mark Payment" in `Billing.tsx` likely does the same.
- `hdfc-create-session` always charges the full outstanding balance — no partial input from student.
- Student dashboard `StudentInvoices.tsx` has no partial-amount UI.
- No payment-count enforcement anywhere.

## Plan

### 1. Single source of truth: `reconcile_invoice` DB function (migration)

Create `public.reconcile_invoice(_invoice_id uuid)` (SECURITY DEFINER) that:
- Sums `payments.amount WHERE invoice_id = _invoice_id AND status = 'completed'`.
- Sums `refunds.amount` for the invoice (if any).
- Updates `invoices.paid_amount`, `status` (`paid` if ≥ total, `partial` if > 0, `pending` otherwise; `overdue` if pending & past `due_date`), `payment_date` (latest completed payment timestamp when fully paid), and `payment_method` (last used).
- Returns the new row.

Add an `AFTER INSERT/UPDATE/DELETE` trigger on `payments` and `refunds` that calls `reconcile_invoice(NEW.invoice_id)` so reconciliation happens automatically — no more drift regardless of which code path inserts a payment.

Delete the duplicate TS reconciler in `hdfc-webhook` (or have it just call the SQL function).

### 2. Enforce "max 3 partial payments per invoice"

In the same migration, in `reconcile_invoice` (and a `BEFORE INSERT` trigger on `payments`):
- Count existing `completed` payments for the invoice.
- If count ≥ 3, reject the insert with a clear error.
- If count = 2 (this is the 3rd payment) and `existing_paid + new_amount < invoice.total_amount`, reject with "Final payment must clear the balance".

This guarantees the rule regardless of caller (student, admin, webhook).

### 3. Student dashboard — partial payment UI

`src/pages/student/StudentInvoices.tsx`:
- Replace single "Pay Online" button with a small dialog that shows: total, paid so far, balance, payments-used (`x/3`).
- Amount input (default = balance). Constraints:
  - Min = 1, Max = balance.
  - If `payments_count == 2` → amount input is locked to `balance` with a note "Final partial payment must clear the balance."
  - If `payments_count == 3` → no pay button (already shouldn't be unpaid, but defensive).
- Submit calls `hdfc-create-session` with `{ invoice_id, amount }`.

`supabase/functions/hdfc-create-session/index.ts`:
- Accept optional `amount` from request body.
- Validate: `0 < amount ≤ balance`; re-check the 3-payment rule server-side; if 3rd payment, require `amount == balance`.
- Pass the (partial) amount to HDFC instead of always using full balance.

The existing webhook → payments → reconcile flow then naturally records the partial payment and flips the invoice to `partial` or `paid`.

### 4. Admin offline payment — global search bar in Billing

`src/pages/Billing.tsx`:
- Add a sticky search bar at the top: input + debounced query against `students` (form number / full name / phone). Show a dropdown of matching students with their **outstanding invoices** (number, balance, payments used `x/3`).
- Clicking an outstanding invoice opens the existing "Record Payment" dialog pre-filled with that invoice.
- Refactor the existing "Mark Payment" / bulk-generate flow to **insert a `payments` row** (with mode = `cash` / `upi` / `bank_transfer` / `card`, reference, UTR, recorded_by, paid_at) and **stop writing `paid_amount` / `status` directly** on the invoice — the trigger handles it.
- The 3-payment rule is enforced server-side, so the dialog also shows live "Payment x of 3" and disables submit / locks amount appropriately, mirroring the student UI.

### 5. Receipts

- **Per-payment receipt**: in `StudentInvoices.tsx` and `Billing.tsx`, render a "Download receipt" action next to each row in the per-invoice payments list (the existing `PaymentOrderDetails` already lists payments — extend it). Receipt PDF includes invoice number, payment id, amount, mode, txn ref, date, running balance after this payment, branding ("Anuttama Hostels" / "Powered by Hostylia Payments").
- **Final paid receipt**: when `invoice.status == 'paid'`, also expose a "Download paid-in-full invoice receipt" that lists all payments and shows ₹0 balance.
- Reuse the existing PDF helper used for invoice download; add a small `generatePaymentReceiptPdf(payment, invoice)` and `generatePaidInvoiceReceiptPdf(invoice, payments)`.

### 6. Cleanup of duplicated logic

- Remove `paid_amount` / `status` writes from `Billing.tsx` bulk-generate (only seed the invoice; insert the matching payment row; let trigger reconcile).
- `create-student` continues to insert installment invoices with `total_amount = paid_amount` AND a payments row — change it to insert invoice with `paid_amount = 0` and let the trigger set it from the payments row. This avoids the same drift at student-creation time.
- `hdfc-webhook` `reconcileInvoice` becomes a thin call to `select reconcile_invoice(...)`.

## Technical details

- Tables touched: `invoices`, `payments`, `refunds` (function + triggers only — no column changes).
- New SQL: `public.reconcile_invoice(uuid)`, `public.enforce_payment_rules()` trigger function, triggers on `payments` (BEFORE INSERT for rules, AFTER INSERT/UPDATE/DELETE for reconcile) and on `refunds` (AFTER INSERT/UPDATE/DELETE for reconcile).
- Edge function changes: `hdfc-create-session` (accept `amount`, validate), `hdfc-webhook` (delegate to SQL), `create-student` (stop manually setting `paid_amount`).
- Frontend changes: `src/pages/Billing.tsx` (search bar, refactor payment recording), `src/pages/student/StudentInvoices.tsx` (partial-payment dialog, receipts), `PaymentOrderDetails` (per-payment receipt download).
- Backfill: one-time `UPDATE` running `reconcile_invoice(id)` for every existing invoice so historical data matches the new invariants.

## Out of scope (won't touch)

- Invoice structure at student creation (you chose to keep separate invoices per installment).
- Refund flow logic (only made reactive to reconcile).
- HDFC keys / gateway config.

## Open assumption to confirm during build

The 3-payment limit applies per invoice. The "balance" invoice generated at student creation is itself one invoice → it gets its own 3-partial-payment budget. Let me know if you instead want the balance invoice to allow unlimited partial payments.
