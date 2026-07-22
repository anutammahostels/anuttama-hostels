## Reconciliation result (Excel vs current DB, per-Form Number)

Matched **1,226 of 1,228** Sarjapur students by Form Number. Deltas across the entire receivables book are small and fully explained:

| Check | Result | Amount impact |
|---|---|---|
| Gross Receivable per student | **0 mismatches** across 1,226 matched students | ₹0 |
| Total Received (A1+A2+A3) per student | **0 mismatches** across 1,226 matched students | ₹0 |
| Form-number-only mismatch (student & amounts identical) | **2 students** | ₹0 |
| Refund missing in DB (form in DB, refund not imported earlier) | **4 students** | ₹4,27,000 |
| Refund with no valid Form Number in Refund Excel | **2 rows** (Samudyatha P, NAYANA) | ₹90,000 |
| Manual override you specified (SAKSHI RACHAGOND second ₹60k payment) | 1 payment row | ₹60,000 |

Total DB adjustments needed to make DB match the two Excels + your override = **₹5,77,000** (not ₹33,35,000 — see "About the ₹33.35 L number" below).

## Detailed reconciliation report

### A. Form-Number-only mismatch (rename, no financial change)
Same student, same fees, same payments — only the roll_number differs.

| Student | DB form_no | Excel form_no | Action |
|---|---|---|---|
| PRITAM PRAKASH NAYAK | 2460847068 | 2461196442 | UPDATE students.roll_number → 2461196442 |
| DHEERAJ R | 2461098765 | 2461585745 | UPDATE students.roll_number → 2461585745 |

### B. Missing refunds (4 students, ₹4,27,000)
All four students already exist in the DB; only their refund rows were not imported in the last pass because the earlier refund-Excel had different Form Numbers.

| Form No | Student | Refund Amount | Mode | Date |
|---|---|---|---|---|
| 2460237980 | MOKSHITH D S | ₹1,75,000 | UPI | 2026-05-10 |
| 2460778233 | LUCKY BHASKAR | ₹5,000 | UPI | 2026-04-10 |
| 2460983772 | SRIYA REDDY YEDDULA | ₹85,000 | UPI | 2026-05-14 |
| 2461343661 | AMULYA | ₹1,62,000 | CASH | (blank in Excel — use import date) |

For each: INSERT refund row linked to the student's oldest completed-payment invoice, `status='processed'`, then call `public.reconcile_invoice(invoice_id)` so paid_amount/status recompute.

### C. Refund rows with unresolvable Form Number (₹90,000) — you approved "create missing students"
| Form No in Excel | Student | Amount | Mode |
|---|---|---|---|
| "NOT PAID" | Samudyatha P | ₹60,000 | Cash |
| "ALLEN NOT PAID" | NAYANA | ₹30,000 | UPI |

Per your instruction I'll create these two students under Sarjapur with placeholder Form Numbers (`REFUND-SAMUDYATHA-P`, `REFUND-NAYANA-ALLEN`), a synthetic ₹0-fee "refund-only" invoice, plus the refund row. Marked in a comment so you can rename later once you send the real Form Numbers.

### D. SAKSHI RACHAGOND manual override (₹60,000)
- DB and client Excel both show two ₹60,000 UPI payments (₹1,20,000 total).
- You explicitly told me the correct value is ₹60,000. I'll DELETE the later of the two `payments` rows for invoice, then `reconcile_invoice()` — bringing paid_amount to ₹60,000 and due to ₹1,30,000.
- Note: this makes the DB disagree with the client Excel by ₹60k on this single row. Flagging so we're aligned before I execute.

## About the ₹33,35,000 number
I could not reproduce a ₹33.35 L gap from the uploaded files. The measured picture is:

| Metric | Client Excel | Current DB | Diff |
|---|---|---|---|
| Gross Receivable (Sarjapur) | ₹22,14,81,000 | ₹22,14,81,000 | ₹0 |
| Amount Received (A1+A2+A3 sum) | ₹18,24,99,599 | ₹18,24,99,599 | ₹0 |
| Refunds | ₹49,16,000 (44 rows) | ₹43,54,000 (37 rows) | ₹5,62,000 (of which ₹4,27,000 → §B, ₹90,000 → §C, ₹45,000 = PREETHAM PRAKASH 2461196442 which collides with §A's DB form and will be handled after the rename) |

After applying §A + §B + §C + §D, DB will read:
- Amount Received = ₹18,24,99,599 − ₹60,000 (SAKSHI) = **₹18,24,39,599** ✅ matches your target
- Total Refunds = ₹43,54,000 + ₹4,27,000 + ₹90,000 + ₹45,000 (PREETHAM after rename) = **₹49,16,000** ✅ matches Refund Excel

Your "Net Receivable ₹3,88,71,401" target still leaves an unexplained ₹1,70,000 vs the arithmetic (Gross − Received = ₹3,90,41,401 post-fix). Before executing I need you to confirm which of these the client uses for "Net Receivable":
- (a) `Gross − Received` (would give ₹3,90,41,401)
- (b) `Gross − Received + Refunds` (would give ₹4,39,57,401)
- (c) `Gross − Received − Refunds` (would give ₹3,41,25,401)
- (d) Something else — please share the formula.

## SQL to be executed (previewed here, NOT run)

```sql
-- §A  Form-number renames
UPDATE public.students SET roll_number='2461196442'
 WHERE roll_number='2460847068' AND property_id=(SELECT id FROM properties WHERE name ILIKE 'sarjapur');
UPDATE public.students SET roll_number='2461585745'
 WHERE roll_number='2461098765' AND property_id=(SELECT id FROM properties WHERE name ILIKE 'sarjapur');

-- §B  Missing refunds (idempotent — WHERE NOT EXISTS guards)
-- One block per student, e.g. MOKSHITH:
INSERT INTO public.refunds (student_id, invoice_id, property_id, amount, refund_method, status, created_at, reason)
SELECT s.id, i.id, s.property_id, 175000, 'upi', 'processed', '2026-05-10', 'Refund import (Excel S.No 20)'
FROM public.students s
JOIN LATERAL (SELECT id FROM public.invoices WHERE student_id=s.id ORDER BY created_at LIMIT 1) i ON TRUE
WHERE s.roll_number='2460237980'
  AND NOT EXISTS (SELECT 1 FROM public.refunds r WHERE r.student_id=s.id AND r.amount=175000);
-- (same shape for LUCKY BHASKAR 5000, SRIYA 85000, AMULYA 162000)

-- §C  Create Samudyatha P + NAYANA with placeholder form & refund-only invoice.

-- §D  SAKSHI override
DELETE FROM public.payments
 WHERE id=(
   SELECT p.id FROM public.payments p
   JOIN public.students s ON s.id=p.student_id
   WHERE s.roll_number='2460276367' AND p.amount=60000 AND p.status='completed'
   ORDER BY p.paid_at DESC NULLS LAST, p.created_at DESC LIMIT 1);

-- After all: run reconcile on every touched invoice
SELECT public.reconcile_invoice(i.id)
  FROM public.invoices i JOIN public.students s ON s.id=i.student_id
 WHERE s.roll_number IN ('2461196442','2461585745','2460237980','2460778233','2460983772','2461343661','2460276367','REFUND-SAMUDYATHA-P','REFUND-NAYANA-ALLEN');
```

Full statements will be assembled in a single idempotent migration file when you approve. Migration will end with a `SELECT` printing before/after totals for Amount Received, Refunds, and Net Receivable so you can verify against your target values.

## Delivery
- One migration file with everything from §A–§D, all guarded so a re-run does nothing.
- Post-run verification query.
- Two open items to confirm before I execute:
  1. Which "Net Receivable" formula the client uses (see options above).
  2. Confirm SAKSHI's DB should be ₹60k even though her Excel row shows ₹1,20,000.
