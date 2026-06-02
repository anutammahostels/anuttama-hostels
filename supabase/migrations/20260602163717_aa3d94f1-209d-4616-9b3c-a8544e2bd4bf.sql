-- Delete orphaned invoices (no student or student no longer exists) and their dependent records
WITH orphan AS (
  SELECT i.id FROM public.invoices i
  LEFT JOIN public.students s ON s.id = i.student_id
  WHERE i.student_id IS NULL OR s.id IS NULL
)
DELETE FROM public.payments WHERE invoice_id IN (SELECT id FROM orphan);

WITH orphan AS (
  SELECT i.id FROM public.invoices i
  LEFT JOIN public.students s ON s.id = i.student_id
  WHERE i.student_id IS NULL OR s.id IS NULL
)
DELETE FROM public.refunds WHERE invoice_id IN (SELECT id FROM orphan);

WITH orphan AS (
  SELECT i.id FROM public.invoices i
  LEFT JOIN public.students s ON s.id = i.student_id
  WHERE i.student_id IS NULL OR s.id IS NULL
)
DELETE FROM public.payment_transactions WHERE invoice_id IN (SELECT id FROM orphan);

DELETE FROM public.invoices i
WHERE i.student_id IS NULL
   OR NOT EXISTS (SELECT 1 FROM public.students s WHERE s.id = i.student_id);
