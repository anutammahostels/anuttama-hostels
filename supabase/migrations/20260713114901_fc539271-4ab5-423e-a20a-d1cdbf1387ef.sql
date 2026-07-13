
-- Step 1: Merge exact-amount duplicate paid invoices onto their still-pending scheduled sibling
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    WITH pending AS (
      SELECT id, student_id, total_amount, created_at
      FROM public.invoices
      WHERE student_id IS NOT NULL AND status IN ('pending','overdue','partial')
        AND (invoice_number LIKE '%-BAL-%' OR invoice_number LIKE '%-P_-%')
    ),
    adhoc AS (
      SELECT id, student_id, total_amount, created_at
      FROM public.invoices
      WHERE student_id IS NOT NULL AND status='paid'
        AND invoice_number NOT LIKE '%-BAL-%' AND invoice_number NOT LIKE '%-P_-%'
    )
    SELECT p.id AS pending_id, a.id AS dup_id
    FROM pending p
    JOIN LATERAL (
      SELECT id FROM adhoc a
      WHERE a.student_id=p.student_id
        AND a.created_at > p.created_at
        AND ABS(a.total_amount - p.total_amount) < 0.01
      ORDER BY a.created_at ASC LIMIT 1
    ) a ON true
  LOOP
    UPDATE public.payment_transactions SET invoice_id = r.pending_id WHERE invoice_id = r.dup_id;
    UPDATE public.payments SET invoice_id = r.pending_id WHERE invoice_id = r.dup_id;
    DELETE FROM public.invoices WHERE id = r.dup_id;
    PERFORM public.reconcile_invoice(r.pending_id);
  END LOOP;
END $$;

-- Step 2: Flush orphaned finance rows

-- refunds: no live student
DELETE FROM public.refunds
WHERE student_id IS NULL
   OR student_id NOT IN (SELECT id FROM public.students);

-- payments: no live student
DELETE FROM public.payments
WHERE student_id IS NULL
   OR student_id NOT IN (SELECT id FROM public.students);

-- payment_transactions: linked invoice missing or has no live student
DELETE FROM public.payment_transactions
WHERE invoice_id IS NULL
   OR invoice_id NOT IN (
      SELECT id FROM public.invoices
      WHERE student_id IS NOT NULL AND student_id IN (SELECT id FROM public.students)
   );

-- invoices: no live student (cascades to remaining payments)
DELETE FROM public.invoices
WHERE student_id IS NULL
   OR student_id NOT IN (SELECT id FROM public.students);

-- payment_logs: order not referenced by any surviving txn/payment (skip reconciliation summaries)
DELETE FROM public.payment_logs
WHERE order_id IS NOT NULL
  AND order_id NOT LIKE 'RECONCILE-%'
  AND NOT EXISTS (SELECT 1 FROM public.payment_transactions pt WHERE pt.order_id = payment_logs.order_id)
  AND NOT EXISTS (SELECT 1 FROM public.payments p WHERE p.transaction_id = payment_logs.order_id);

-- Step 3: Cascade future student deletions across finance tables
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_student_id_fkey,
  ADD  CONSTRAINT invoices_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_student_id_fkey,
  ADD  CONSTRAINT payments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.refunds
  DROP CONSTRAINT IF EXISTS refunds_student_id_fkey,
  ADD  CONSTRAINT refunds_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
