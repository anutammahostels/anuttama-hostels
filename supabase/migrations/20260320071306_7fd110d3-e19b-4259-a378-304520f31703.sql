
-- Remove the overly permissive anon policy
DROP POLICY IF EXISTS "Anyone can submit admission" ON public.admissions;

-- Replace with authenticated policy that allows staff to create admissions
CREATE POLICY "Staff can create admissions" ON public.admissions
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'tenant_admin') OR has_role(auth.uid(), 'warden'));
