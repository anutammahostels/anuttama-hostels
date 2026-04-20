-- Replace overly-permissive profiles SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Profiles visible to self, staff, and linked parents"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- own profile
  auth.uid() = id
  -- staff roles need profile data for joins across the admin app
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'tenant_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'warden'::public.app_role)
  OR public.has_role(auth.uid(), 'accountant'::public.app_role)
  OR public.has_role(auth.uid(), 'security_guard'::public.app_role)
  -- parents can see their child's profile
  OR EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = public.profiles.id AND s.parent_id = auth.uid()
  )
);