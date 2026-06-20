
-- 1. Properties: scope accountant/warden/security_guard SELECT to assigned properties
DROP POLICY IF EXISTS "Accountants can view properties" ON public.properties;
DROP POLICY IF EXISTS "Staff and linked users view properties" ON public.properties;

CREATE POLICY "Staff and linked users view properties"
ON public.properties
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (owner_id = auth.uid())
  OR (
    (has_role(auth.uid(), 'warden'::app_role)
     OR has_role(auth.uid(), 'accountant'::app_role)
     OR has_role(auth.uid(), 'security_guard'::app_role))
    AND staff_has_property_access(auth.uid(), id)
  )
  OR EXISTS (
    SELECT 1
    FROM students s
    JOIN beds b ON b.student_id = s.id
    JOIN rooms r ON r.id = b.room_id
    JOIN floors f ON f.id = r.floor_id
    JOIN blocks bl ON bl.id = f.block_id
    WHERE bl.property_id = properties.id
      AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
  )
);

-- 2. user_roles: prevent tenant_admin from assigning super_admin
DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;

CREATE POLICY "Super admins manage all roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Tenant admins manage non-superadmin roles"
ON public.user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'tenant_admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND role <> 'tenant_admin'::app_role
)
WITH CHECK (
  has_role(auth.uid(), 'tenant_admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND role <> 'tenant_admin'::app_role
);

-- 3. attendance: scope warden INSERT/UPDATE to assigned properties
DROP POLICY IF EXISTS "Staff can mark attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can update attendance" ON public.attendance;

CREATE POLICY "Staff can mark attendance"
ON public.attendance
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND staff_has_property_access(auth.uid(), property_id))
);

CREATE POLICY "Staff can update attendance"
ON public.attendance
FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND staff_has_property_access(auth.uid(), property_id))
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND staff_has_property_access(auth.uid(), property_id))
);

-- 4. students: scope warden access to assigned properties
DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;

CREATE POLICY "Admins and staff can view students"
ON public.students
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (
    (has_role(auth.uid(), 'warden'::app_role)
     OR has_role(auth.uid(), 'accountant'::app_role))
    AND staff_has_property_access(auth.uid(), property_id)
  )
  OR (user_id = auth.uid())
  OR (parent_id = auth.uid())
);

CREATE POLICY "Admins and wardens can manage students"
ON public.students
FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND staff_has_property_access(auth.uid(), property_id))
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND staff_has_property_access(auth.uid(), property_id))
);
