
DO $$
DECLARE
  _sarjapur uuid := (SELECT id FROM public.properties WHERE name ILIKE 'sarjapur' LIMIT 1);
  _holder_invoice uuid;
  _sakshi_payment uuid;
BEGIN
  -- =====================================================================
  -- §A  Form-number renames (student & amounts already identical)
  -- =====================================================================
  UPDATE public.students SET roll_number = '2461196442'
   WHERE roll_number = '2460847068' AND property_id = _sarjapur;

  UPDATE public.students SET roll_number = '2461585745'
   WHERE roll_number = '2461098765' AND property_id = _sarjapur;

  -- =====================================================================
  -- §B  Missing refunds (link to student's oldest invoice)
  -- =====================================================================
  -- MOKSHITH D S — ₹1,75,000 UPI 2026-05-10
  INSERT INTO public.refunds (student_id, invoice_id, property_id, amount, refund_method, status, created_at, reason)
  SELECT s.id, i.id, s.property_id, 175000, 'upi', 'processed',
         '2026-05-10 00:00:00+05:30'::timestamptz,
         'Refund import (Excel S.No 20) - MOKSHITH D S'
  FROM public.students s
  JOIN LATERAL (SELECT id FROM public.invoices WHERE student_id = s.id ORDER BY created_at LIMIT 1) i ON TRUE
  WHERE s.roll_number = '2460237980'
    AND NOT EXISTS (SELECT 1 FROM public.refunds r WHERE r.student_id = s.id AND r.amount = 175000);

  -- LUCKY BHASKAR — ₹5,000 UPI 2026-04-10
  INSERT INTO public.refunds (student_id, invoice_id, property_id, amount, refund_method, status, created_at, reason)
  SELECT s.id, i.id, s.property_id, 5000, 'upi', 'processed',
         '2026-04-10 00:00:00+05:30'::timestamptz,
         'Refund import (Excel S.No 9) - LUCKY BHASKAR'
  FROM public.students s
  JOIN LATERAL (SELECT id FROM public.invoices WHERE student_id = s.id ORDER BY created_at LIMIT 1) i ON TRUE
  WHERE s.roll_number = '2460778233'
    AND NOT EXISTS (SELECT 1 FROM public.refunds r WHERE r.student_id = s.id AND r.amount = 5000);

  -- SRIYA REDDY YEDDULA — ₹85,000 UPI 2026-05-14
  INSERT INTO public.refunds (student_id, invoice_id, property_id, amount, refund_method, status, created_at, reason)
  SELECT s.id, i.id, s.property_id, 85000, 'upi', 'processed',
         '2026-05-14 00:00:00+05:30'::timestamptz,
         'Refund import (Excel S.No 12) - SRIYA REDDY YEDDULA'
  FROM public.students s
  JOIN LATERAL (SELECT id FROM public.invoices WHERE student_id = s.id ORDER BY created_at LIMIT 1) i ON TRUE
  WHERE s.roll_number = '2460983772'
    AND NOT EXISTS (SELECT 1 FROM public.refunds r WHERE r.student_id = s.id AND r.amount = 85000);

  -- AMULYA — ₹1,62,000 CASH (date blank in Excel)
  INSERT INTO public.refunds (student_id, invoice_id, property_id, amount, refund_method, status, created_at, reason)
  SELECT s.id, i.id, s.property_id, 162000, 'cash', 'processed',
         now(),
         'Refund import (Excel S.No 45) - AMULYA'
  FROM public.students s
  JOIN LATERAL (SELECT id FROM public.invoices WHERE student_id = s.id ORDER BY created_at LIMIT 1) i ON TRUE
  WHERE s.roll_number = '2461343661'
    AND NOT EXISTS (SELECT 1 FROM public.refunds r WHERE r.student_id = s.id AND r.amount = 162000);

  -- =====================================================================
  -- §C  Refunds without valid Form Number — attach to a placeholder
  --     "unassigned refunds" invoice under Sarjapur (student_id = NULL).
  -- =====================================================================
  SELECT id INTO _holder_invoice
    FROM public.invoices
   WHERE invoice_number = 'REFUND-HOLDER-SARJAPUR'
   LIMIT 1;

  IF _holder_invoice IS NULL THEN
    INSERT INTO public.invoices (invoice_number, billing_month, total_amount, due_date, status, notes)
    VALUES ('REFUND-HOLDER-SARJAPUR', CURRENT_DATE, 0, CURRENT_DATE, 'paid',
            'Placeholder invoice for refunds whose Form Number is missing/invalid in the client Refund Excel')
    RETURNING id INTO _holder_invoice;
  END IF;

  -- Samudyatha P — ₹60,000 CASH
  INSERT INTO public.refunds (student_id, invoice_id, property_id, amount, refund_method, status, created_at, reason)
  SELECT NULL, _holder_invoice, _sarjapur, 60000, 'cash', 'processed',
         '2026-01-04 00:00:00+05:30'::timestamptz,
         'Refund import (Excel S.No 8) - Samudyatha P - Form marked "NOT PAID" - unassigned'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.refunds
     WHERE invoice_id = _holder_invoice AND amount = 60000
       AND reason ILIKE '%Samudyatha%'
  );

  -- NAYANA — ₹30,000 UPI
  INSERT INTO public.refunds (student_id, invoice_id, property_id, amount, refund_method, status, created_at, reason)
  SELECT NULL, _holder_invoice, _sarjapur, 30000, 'upi', 'processed',
         '2026-05-11 00:00:00+05:30'::timestamptz,
         'Refund import (Excel S.No 34) - NAYANA - Form marked "ALLEN NOT PAID" - unassigned'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.refunds
     WHERE invoice_id = _holder_invoice AND amount = 30000
       AND reason ILIKE '%NAYANA%'
  );

  -- =====================================================================
  -- §D  SAKSHI RACHAGOND — remove the second duplicate ₹60,000 payment
  -- =====================================================================
  SELECT p.id INTO _sakshi_payment
    FROM public.payments p
    JOIN public.students s ON s.id = p.student_id
   WHERE s.roll_number = '2460276367'
     AND p.amount = 60000
     AND p.status = 'completed'
   ORDER BY p.paid_at DESC NULLS LAST, p.created_at DESC
   LIMIT 1;

  IF _sakshi_payment IS NOT NULL
     AND (SELECT COUNT(*) FROM public.payments p
           JOIN public.students s ON s.id = p.student_id
          WHERE s.roll_number = '2460276367'
            AND p.amount = 60000
            AND p.status = 'completed') > 1
  THEN
    DELETE FROM public.payments WHERE id = _sakshi_payment;
  END IF;

  -- =====================================================================
  -- Reconcile every touched invoice
  -- =====================================================================
  PERFORM public.reconcile_invoice(i.id)
    FROM public.invoices i
    JOIN public.students s ON s.id = i.student_id
   WHERE s.roll_number IN (
     '2461196442','2461585745',
     '2460237980','2460778233','2460983772','2461343661',
     '2460276367'
   );
END $$;

-- =====================================================================
-- Verification (visible in migration output)
-- =====================================================================
DO $$
DECLARE
  _sarjapur uuid := (SELECT id FROM public.properties WHERE name ILIKE 'sarjapur' LIMIT 1);
  _gross numeric;
  _received numeric;
  _refunds numeric;
BEGIN
  SELECT coalesce(sum(i.total_amount),0) INTO _gross
    FROM public.invoices i JOIN public.students s ON s.id = i.student_id
   WHERE s.property_id = _sarjapur;

  SELECT coalesce(sum(p.amount),0) INTO _received
    FROM public.payments p JOIN public.students s ON s.id = p.student_id
   WHERE s.property_id = _sarjapur AND p.status = 'completed';

  SELECT coalesce(sum(r.amount),0) INTO _refunds
    FROM public.refunds r
   WHERE r.property_id = _sarjapur
     AND r.status IN ('processed','completed','success');

  RAISE NOTICE 'SARJAPUR TOTALS AFTER RECONCILIATION:';
  RAISE NOTICE '  Gross Receivable : %', _gross;
  RAISE NOTICE '  Amount Received  : %  (target 18,24,39,599)', _received;
  RAISE NOTICE '  Refunds          : %  (target 49,16,000)', _refunds;
  RAISE NOTICE '  Net (Gross-Recv) : %', _gross - _received;
END $$;
