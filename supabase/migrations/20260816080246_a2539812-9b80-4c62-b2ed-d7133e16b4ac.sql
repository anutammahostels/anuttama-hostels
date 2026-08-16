CREATE OR REPLACE FUNCTION public.enforce_payment_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _completed_count int;
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

  SELECT COUNT(*) INTO _completed_count
  FROM public.payments
  WHERE invoice_id = NEW.invoice_id
    AND status = 'completed'
    AND id <> NEW.id;

  IF _completed_count >= 3 THEN
    RAISE EXCEPTION 'This invoice already has 3 completed payments; no further partial payments are allowed.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$function$;