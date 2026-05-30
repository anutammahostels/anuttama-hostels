
-- 1) PROFILES: restrict broad PII access
DROP POLICY IF EXISTS "Profiles visible to self, staff, and linked parents" ON public.profiles;

CREATE POLICY "Profiles visible to self, admins, wardens, linked parents"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR has_role(auth.uid(), 'warden'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = profiles.id AND s.parent_id = auth.uid()
  )
);

-- 2) ATTENDANCE: scope policies to authenticated
DROP POLICY IF EXISTS "Staff can mark attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can view attendance for their properties" ON public.attendance;

CREATE POLICY "Staff can mark attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['super_admin'::app_role, 'tenant_admin'::app_role, 'warden'::app_role])
  )
);

CREATE POLICY "Staff can update attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['super_admin'::app_role, 'tenant_admin'::app_role, 'warden'::app_role])
  )
);

CREATE POLICY "Staff can view attendance for their properties"
ON public.attendance
FOR SELECT
TO authenticated
USING (
  property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['super_admin'::app_role, 'tenant_admin'::app_role, 'warden'::app_role])
  )
);

-- 3) COMPLAINTS: scope policies to authenticated
DROP POLICY IF EXISTS "Staff can update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students can view their complaints" ON public.complaints;

CREATE POLICY "Staff can update complaints"
ON public.complaints
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['super_admin'::app_role, 'tenant_admin'::app_role, 'warden'::app_role])
  )
);

CREATE POLICY "Students can create complaints"
ON public.complaints
FOR INSERT
TO authenticated
WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

CREATE POLICY "Students can view their complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  OR property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['super_admin'::app_role, 'tenant_admin'::app_role, 'warden'::app_role])
  )
);

-- 4) NOTICES write policies: scope to authenticated (keep SELECT for public active notices)
DROP POLICY IF EXISTS "Staff can create notices" ON public.notices;
DROP POLICY IF EXISTS "Staff can delete notices" ON public.notices;
DROP POLICY IF EXISTS "Staff can update notices" ON public.notices;

CREATE POLICY "Staff can create notices"
ON public.notices
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['super_admin'::app_role, 'tenant_admin'::app_role, 'warden'::app_role])
  )
);

CREATE POLICY "Staff can delete notices"
ON public.notices
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['super_admin'::app_role, 'tenant_admin'::app_role])
  )
);

CREATE POLICY "Staff can update notices"
ON public.notices
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['super_admin'::app_role, 'tenant_admin'::app_role])
  )
);
