
-- 1. Employees PII exposure
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;

-- 2. Privilege escalation via user_roles self-insert
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- 3. Beds exposure - restrict view
DROP POLICY IF EXISTS "Authenticated users can view beds" ON public.beds;
CREATE POLICY "Staff and assigned student can view beds"
ON public.beds FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR has_role(auth.uid(), 'warden'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'security_guard'::app_role)
  OR (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid()))
);

-- 4. Revoke EXECUTE on SECURITY DEFINER functions from anon
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
