
-- Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix permissive RLS policy for maintenance tickets insert
DROP POLICY IF EXISTS "Create maintenance tickets" ON public.maintenance_tickets;
CREATE POLICY "Create maintenance tickets" ON public.maintenance_tickets 
FOR INSERT TO authenticated 
WITH CHECK (reported_by = auth.uid());
