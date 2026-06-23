
-- =====================================================
-- Payment reconciliation + partial-payment rule
-- =====================================================

-- 1. reconcile_invoice: single source of truth for invoice paid_amount/status
CREATE OR REPLACE FUNCTION public.reconcile_invoice(_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total numeric;
  _due_date date;
  _paid numeric;
  _refunded numeric;
  _net numeric;
  _status text;
  _last_paid_at timestamptz;
  _last_method text;
BEGIN
  IF _invoice_id IS NULL THEN RETURN; END IF;

  SELECT total_amount, due_date INTO _total, _due_date
  FROM public.invoices WHERE id = _invoice_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COALESCE(SUM(amount), 0),
         MAX(paid_at),
         (SELECT payment_method FROM public.payments
            WHERE invoice_id = _invoice_id AND status = 'completed'
            ORDER BY paid_at DESC NULLS LAST, created_at DESC LIMIT 1)
    INTO _paid, _last_paid_at, _last_method
  FROM public.payments
  WHERE invoice_id = _invoice_id AND status = 'completed';

  SELECT COALESCE(SUM(amount), 0) INTO _refunded
  FROM public.refunds
  WHERE invoice_id = _invoice_id
    AND status IN ('processed', 'completed', 'success');

  _net := GREATEST(0, COALESCE(_paid, 0) - COALESCE(_refunded, 0));

  IF COALESCE(_total, 0) > 0 AND _net >= _total THEN
    _status := 'paid';
  ELSIF _net > 0 THEN
    _status := 'partial';
  ELSIF _due_date IS NOT NULL AND _due_date < CURRENT_DATE THEN
    _status := 'overdue';
  ELSE
    _status := 'pending';
  END IF;

  UPDATE public.invoices
  SET paid_amount = _net,
      status = _status,
      payment_date = CASE WHEN _status = 'paid' THEN _last_paid_at ELSE NULL END,
      payment_method = CASE WHEN _net > 0 THEN _last_method ELSE NULL END
  WHERE id = _invoice_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reconcile_invoice(uuid) TO authenticated, service_role;

-- 2. enforce_payment_rules: 3 partial payments max; 3rd must clear balance
CREATE OR REPLACE FUNCTION public.enforce_payment_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _completed_count int;
  _completed_sum numeric;
  _total numeric;
  _becoming_completed boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _becoming_completed := (NEW.status = 'completed');
  ELSIF TG_OP = 'UPDATE' THEN
    _becoming_completed := (NEW.status = 'completed' AND COALESCE(OLD.status,'') <> 'completed');
  END IF;

  IF NOT _becoming_completed THEN
    RETURN NEW;
  END IF;

  SELECT total_amount INTO _total
  FROM public.invoices WHERE id = NEW.invoice_id;
  IF _total IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO _completed_count, _completed_sum
  FROM public.payments
  WHERE invoice_id = NEW.invoice_id
    AND status = 'completed'
    AND id <> NEW.id;

  IF _completed_count >= 3 THEN
    RAISE EXCEPTION 'This invoice already has 3 completed payments; no further partial payments are allowed.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- The 3rd partial payment must clear the remaining balance.
  IF _completed_count = 2 THEN
    IF (_completed_sum + NEW.amount) < _total - 0.01 THEN
      RAISE EXCEPTION 'This is the final allowed payment for the invoice — it must clear the full remaining balance of %.', (_total - _completed_sum)
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. reconcile trigger function (AFTER payments/refunds change)
CREATE OR REPLACE FUNCTION public.trg_reconcile_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.reconcile_invoice(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM public.reconcile_invoice(NEW.invoice_id);
    IF TG_OP = 'UPDATE' AND OLD.invoice_id IS DISTINCT FROM NEW.invoice_id THEN
      PERFORM public.reconcile_invoice(OLD.invoice_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

-- 4. Backfill: synthesize a payment row for invoices that have paid_amount > 0
-- but no completed payment records (legacy direct invoice.paid_amount writes).
DO $$
DECLARE
  rec record;
  _prop uuid;
BEGIN
  FOR rec IN
    SELECT i.id, i.student_id, i.paid_amount, i.payment_method, i.payment_date, i.created_at, i.invoice_number
    FROM public.invoices i
    WHERE COALESCE(i.paid_amount, 0) > 0
      AND NOT EXISTS (
        SELECT 1 FROM public.payments p
        WHERE p.invoice_id = i.id AND p.status = 'completed'
      )
  LOOP
    _prop := NULL;
    IF rec.student_id IS NOT NULL THEN
      SELECT b.property_id INTO _prop FROM (
        SELECT blocks.property_id
        FROM public.beds bd
        JOIN public.rooms r ON r.id = bd.room_id
        JOIN public.floors f ON f.id = r.floor_id
        JOIN public.blocks ON blocks.id = f.block_id
        WHERE bd.student_id = rec.student_id
        LIMIT 1
      ) b;
      IF _prop IS NULL THEN
        SELECT s.property_id INTO _prop FROM public.students s WHERE s.id = rec.student_id;
      END IF;
    END IF;
    IF _prop IS NULL THEN
      SELECT id INTO _prop FROM public.properties ORDER BY created_at LIMIT 1;
    END IF;
    IF _prop IS NULL THEN
      CONTINUE; -- cannot synthesize without a property
    END IF;

    INSERT INTO public.payments (
      invoice_id, student_id, property_id, amount, payment_method,
      payment_mode_label, payment_label, status, paid_at
    ) VALUES (
      rec.id, rec.student_id, _prop, rec.paid_amount,
      COALESCE(rec.payment_method, 'cash'),
      rec.payment_method, 'Backfill (historical)', 'completed',
      COALESCE(rec.payment_date, rec.created_at, now())
    );
  END LOOP;
END $$;

-- 5. Create triggers (after backfill so backfill inserts aren't blocked)
DROP TRIGGER IF EXISTS payments_enforce_rules ON public.payments;
CREATE TRIGGER payments_enforce_rules
BEFORE INSERT OR UPDATE OF status, amount ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_rules();

DROP TRIGGER IF EXISTS payments_reconcile ON public.payments;
CREATE TRIGGER payments_reconcile
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.trg_reconcile_invoice();

DROP TRIGGER IF EXISTS refunds_reconcile ON public.refunds;
CREATE TRIGGER refunds_reconcile
AFTER INSERT OR UPDATE OR DELETE ON public.refunds
FOR EACH ROW EXECUTE FUNCTION public.trg_reconcile_invoice();

-- 6. Reconcile all invoices once so historical paid_amount/status matches the new invariants.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.invoices LOOP
    PERFORM public.reconcile_invoice(r.id);
  END LOOP;
END $$;
