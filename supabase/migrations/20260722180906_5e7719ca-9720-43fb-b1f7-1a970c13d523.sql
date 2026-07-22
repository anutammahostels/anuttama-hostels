
DO $$
DECLARE
  _sarjapur uuid := (SELECT id FROM public.properties WHERE name ILIKE 'sarjapur' LIMIT 1);
  _holder_invoice uuid := (SELECT id FROM public.invoices WHERE invoice_number = 'REFUND-HOLDER-SARJAPUR' LIMIT 1);
BEGIN
  INSERT INTO public.refunds (student_id, invoice_id, property_id, amount, refund_method, status, created_at, reason)
  SELECT NULL, _holder_invoice, _sarjapur, 45000, 'upi', 'processed',
         '2026-04-13 00:00:00+05:30'::timestamptz,
         'Refund import (Excel S.No 21) - PREETHAM PRAKASH - Form 2461196442 now assigned to a different student in the client Excel'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.refunds
     WHERE invoice_id = _holder_invoice AND amount = 45000
       AND reason ILIKE '%PREETHAM PRAKASH%'
  );
END $$;

DO $$
DECLARE
  _sarjapur uuid := (SELECT id FROM public.properties WHERE name ILIKE 'sarjapur' LIMIT 1);
  _gross numeric; _received numeric; _refunds numeric;
BEGIN
  SELECT coalesce(sum(i.total_amount),0) INTO _gross FROM public.invoices i JOIN public.students s ON s.id=i.student_id WHERE s.property_id=_sarjapur;
  SELECT coalesce(sum(p.amount),0) INTO _received FROM public.payments p JOIN public.students s ON s.id=p.student_id WHERE s.property_id=_sarjapur AND p.status='completed';
  SELECT coalesce(sum(r.amount),0) INTO _refunds FROM public.refunds r WHERE r.property_id=_sarjapur AND r.status IN ('processed','completed','success');
  RAISE NOTICE 'Gross % Received % Refunds % NetGrossMinusRecv %', _gross, _received, _refunds, (_gross-_received);
END $$;
