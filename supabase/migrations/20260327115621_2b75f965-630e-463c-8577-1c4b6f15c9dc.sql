
CREATE OR REPLACE FUNCTION public.create_notification(
  _target_user_id uuid,
  _title text,
  _message text,
  _type text DEFAULT 'info',
  _link text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (_target_user_id, _title, _message, _type, _link)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;
