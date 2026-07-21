## Goal
Reconcile the Sarjapur DB with the uploaded JSON (1,215 students, ₹21.91 Cr fees, ₹18.08 Cr paid) so it becomes the source of truth. This is a data-only migration — no app code changes.

## Reconciliation Summary (JSON vs current DB)

| Check | Result |
|---|---|
| Students matched by Form Number | 1,214 of 1,215 |
| Missing from DB | **1 student** (MANOJREDDY, form 2460894455, ₹1.8L fee, ₹1.8L paid) |
| Extra in DB not in JSON | 0 |
| Fee (total_amount) mismatches | **29 students** (net DB overcount ≈ ₹4.05 L) |
| Paid amount mismatches | **5 students** (net DB undercount ≈ ₹1.75 L) |

Overall totals after fix: fees ₹21.91 Cr, collected ₹18.08 Cr, dues ₹3.84 Cr for Sarjapur.

## What the migration will do

### 1. Add the missing student
- Insert `MANOJREDDY` (form `2460894455`) under Sarjapur with a ₹1,80,000 fully-paid invoice + one UPI payment record, matching JSON A1 details.

### 2. Fix the 29 fee mismatches
Root cause: extra "balance" invoices were created during earlier data loads. For each of the 29 students, adjust `invoices` so the sum of `total_amount` equals the JSON `FINAL FEE`:
- If DB > JSON (27 students): delete the surplus balance invoice(s), or shrink the last balance invoice to close the gap. Never touch invoices that already have completed payments.
- If DB < JSON (2 students — VIKAS K +₹10K, AGGIDA PRINCY +₹80K): add a balance invoice for the difference.
- Then run `reconcile_invoice()` on each affected invoice so status/paid_amount/dues repopulate correctly.

### 3. Fix the 5 paid-amount mismatches
| Form | Student | Action |
|---|---|---|
| 2460310226 | NIKHIL SM | Insert missing ₹50,000 cash payment (JSON A2) |
| 2460903819 | KISHOR H | Insert missing ₹50,000 UPI payment (JSON A2) |
| 2460997310 | Akshata | Insert missing ₹85,000 cash payment (JSON A2) |
| 2460393995 | SAMARTH CHIKKAMATH | Insert missing ₹50,000 UPI payment (JSON A2) |
| 2460276367 | SAKSHI RACHAGOND | JSON says ₹60K but DB has 2×₹60K completed payments. **Ask user before touching** — the extra payment may be legitimate (recorded after JSON export). Default: leave DB as-is. |

### 4. Recompute all impacted invoices
Call `public.reconcile_invoice(invoice_id)` for every invoice touched so `paid_amount`, `status` (paid/partial/overdue/pending), `payment_date`, and `payment_method` are regenerated from the new payment rows.

## Delivery

- One migration file that (a) inserts the 1 missing student + invoice + payment, (b) surgically corrects the 29 fee mismatches, (c) inserts the 4 missing payments, (d) reconciles every affected invoice.
- All operations idempotent (guarded by form number + amount lookups) so a rerun is safe.
- Post-run verification query printing before/after totals per affected student.

## Open question
**SAKSHI RACHAGOND (form 2460276367)**: JSON shows only one ₹60K payment; DB has two completed ₹60K payments (Apr + Jul). Do you want me to delete the July ₹60K, or leave both (treating the extra as post-export offline payment)?

I will not run this until you approve, and I'll pause on SAKSHI's payment based on your answer.