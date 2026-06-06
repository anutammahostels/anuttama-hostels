
-- 1. Staff property assignments table
CREATE TABLE public.staff_property_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, property_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_property_assignments TO authenticated;
GRANT ALL ON public.staff_property_assignments TO service_role;

ALTER TABLE public.staff_property_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage staff assignments"
  ON public.staff_property_assignments
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin'));

CREATE POLICY "Staff view their own assignments"
  ON public.staff_property_assignments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_staff_property_assignments_user ON public.staff_property_assignments(user_id);
CREATE INDEX idx_staff_property_assignments_property ON public.staff_property_assignments(property_id);

-- 2. Helper function
CREATE OR REPLACE FUNCTION public.staff_has_property_access(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_property_assignments
    WHERE user_id = _user_id AND property_id = _property_id
  );
$$;

-- 3. Tighten attendance: wardens scoped to assigned properties
DROP POLICY IF EXISTS "Staff can view attendance for their properties" ON public.attendance;
CREATE POLICY "Staff can view attendance for their properties"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'tenant_admin')
    OR (property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()))
    OR (public.has_role(auth.uid(), 'warden') AND public.staff_has_property_access(auth.uid(), property_id))
  );

-- 4. Tighten employees: accountants scoped
DROP POLICY IF EXISTS "Accountants can view employees" ON public.employees;
CREATE POLICY "Accountants can view employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'accountant')
    AND public.staff_has_property_access(auth.uid(), property_id)
  );

-- 5. Tighten payroll: accountants AND wardens scoped
DROP POLICY IF EXISTS "Accountants can view payroll" ON public.payroll_records;
DROP POLICY IF EXISTS "Wardens can view payroll" ON public.payroll_records;

CREATE POLICY "Accountants can view payroll for assigned properties"
  ON public.payroll_records
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'accountant')
    AND public.staff_has_property_access(auth.uid(), property_id)
  );

CREATE POLICY "Wardens can view payroll for assigned properties"
  ON public.payroll_records
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'warden')
    AND public.staff_has_property_access(auth.uid(), property_id)
  );
