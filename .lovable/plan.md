## What's actually wrong

I dug into the DB and the code. There are two independent problems compounding each other:

### 1. Massive orphan-invoice pileup (the "14Cr / 4Cr" and "Deleted Student" row)

- `invoices.student_id` uses `ON DELETE SET NULL`. Every time students were bulk-wiped/re-seeded in the past, their invoices stayed behind with `student_id = NULL`.
- Current DB state: **6,916 orphan invoices** totalling **₹65.24 Cr gross / ₹51.74 Cr received**, plus **5,308 orphan payments** totalling **₹51.80 Cr**. There are only 9,246 invoices in total, so ~75% of the rows are ghosts of deleted students.
- `Receivables.tsx` groups every `student_id IS NULL` invoice into a single `"__deleted__"` bucket → one giant "Deleted Student" row you see in the Excel (₹65 Cr / ₹51 Cr). It's also what inflates the dashboard totals to `14Cr collected / 4Cr dues` instead of the real figures.

### 2. FASEEHA KHAZI (and anyone like her) — payment creates a NEW invoice instead of settling the pending one

Her actual invoices in the DB:

```
INV-...-P1   ₹60,000  paid   (Installment 1 of 3)
INV-...-P2   ₹90,000  paid   (Installment 2 of 3)
INV-...-BAL  ₹40,000  pending ← original balance invoice, never marked paid
INV-...-ZEFB ₹40,000  paid   ← duplicate created on 2026-07-13 when admin recorded her balance payment
```

Total fee = ₹1,90,000. She paid 60k + 90k + 40k = ₹1,90,000 ✅. But because the "Record Payment" flow in `src/pages/Billing.tsx` (lines 321–390) **always inserts a fresh invoice for every recorded payment** and never allocates against existing pending/BAL invoices, her BAL 40k is still `pending` and gross = ₹2,30,000, net receivable = ₹40,000 (wrong).

This is a code bug, not a data bug — every manual payment recording creates one duplicate invoice like this.

### 3. Minor: `Receivables.tsx` line 48 sums `total_amount + discounts` into Gross (double counts discount). Harmless today (all discounts = 0) but should be fixed.

---

## Plan

### Step A — Data sanitization migration (one-off)

Run a SQL migration that:

1. **Deletes orphan payments** (`student_id IS NULL` or student not in `students`) and their `payment_transactions` / `payment_logs`. These belong to students that no longer exist.
2. **Deletes orphan invoices** (`student_id IS NULL`). `payments.invoice_id` is `ON DELETE CASCADE`, so residual payments go with them.
3. **Deletes orphan refunds** the same way.
4. **Reconciles Faseeha-style duplicates**: for every student, when a paid standalone invoice covers the exact amount of a still-pending BAL/installment invoice created in the same schedule, delete the duplicate paid invoice and re-point its payment to the pending invoice, then re-run `reconcile_invoice`. Concretely: find pending invoices where `sum(paid standalone invoices for same student created after it) >= total_amount` and merge them.
5. **Change FK to `ON DELETE CASCADE`** on `invoices.student_id`, `payments.student_id`, `refunds.student_id`, `payment_transactions.student_id` (and matching indexes) so a future student delete cleans its finance trail instead of orphaning it. This is a policy shift — see Details below; you can veto and keep SET NULL if you want to preserve historical financial trail.

I'll show the migration in a preview before it runs so you can approve.

### Step B — Fix the payment-recording flow (`src/pages/Billing.tsx`)

Change "Record Payment" so it:

1. First looks up the student's **oldest pending / partial / overdue invoice(s)** ordered by `due_date`.
2. Allocates the entered amount against those invoices via `payments.invoice_id` (the existing `enforce_payment_rules` + `reconcile_invoice` trigger already handles paid_amount/status). Splits across multiple invoices if amount > single invoice balance.
3. Only creates a new "ad-hoc" invoice if the student has zero open dues **and** the admin explicitly ticks a new "Extra / ad-hoc charge" checkbox on the form. That preserves the ability to record an off-schedule payment when it really is new.

### Step C — Fix `Receivables.tsx` aggregation

- Line 48: `existing.gross += inv.total_amount` (drop `+ discounts`).
- Filter out `student_id IS NULL` rows entirely from Receivables view + export (after Step A this is defensive, but keeps the report clean if any slip through in future).
- Same guard on Billing/Dashboard totals so a future orphan can't re-inflate.

### Step D — Verify

1. Re-open Receivables → dashboard totals should drop to the real 4Cr dues / 14Cr collected.
2. Search "FASEEHA KHAZI" → gross ₹1,90,000, received ₹1,90,000, net ₹0.
3. Excel export → no "Deleted Student" row.
4. Record a test payment for a student with a pending BAL invoice → BAL becomes `paid`, no duplicate invoice.

---

## Technical details / open decisions

- **FK cascade change (Step A #5)**: Switching `invoices.student_id` from `SET NULL` to `CASCADE` contradicts the "Financial Data Rules: 'ON DELETE SET NULL' for financial logs" project memory. Two options:
  - **Cascade** (recommended, matches your intent that "deleted students shouldn't linger in financials").
  - **Keep SET NULL** but have the `delete-student` edge function explicitly hard-delete finance rows first. Same end state, memory stays intact.
  Please pick one before I run Step A.
- **Duplicate-merge heuristic (Step A #4)**: I'll match on `student_id` + amount equality + a pending sibling invoice older than the paid one. Faseeha's case fits this exactly. I'll dry-run the SELECT first, show you the candidate list, and only merge after you approve.
- No changes to HDFC webhook / reconcile function — those are working correctly. This is a manual-record + historical-data issue.

Which FK option (cascade vs edge-function-hard-delete) do you want for Step A #5?