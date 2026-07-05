
-- 1) mess_plans: scope SELECT to property members
DROP POLICY IF EXISTS "View mess plans" ON public.mess_plans;
CREATE POLICY "View mess plans" ON public.mess_plans
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR staff_has_property_access(auth.uid(), property_id)
  OR EXISTS (
    SELECT 1 FROM public.students s
    WHERE (s.user_id = auth.uid() OR s.parent_id = auth.uid())
      AND s.property_id = mess_plans.property_id
  )
);

-- 2) notices: remove property_id IS NULL branch; restrict role to authenticated
DROP POLICY IF EXISTS "Authenticated users can view active notices" ON public.notices;
CREATE POLICY "Authenticated users can view active notices" ON public.notices
FOR SELECT TO authenticated
USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'tenant_admin'::app_role)
    OR (property_id IS NOT NULL AND staff_has_property_access(auth.uid(), property_id))
    OR (property_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE (s.user_id = auth.uid() OR s.parent_id = auth.uid())
        AND s.property_id = notices.property_id
    ))
  )
);

-- 3) students: restrict policies to authenticated only, and grant wardens property-scoped SELECT
DROP POLICY IF EXISTS "Admins and staff can view students" ON public.students;
CREATE POLICY "Admins and staff can view students" ON public.students
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id))
  OR (has_role(auth.uid(), 'warden'::app_role) AND staff_has_property_access(auth.uid(), property_id))
  OR user_id = auth.uid()
  OR parent_id = auth.uid()
);

DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students" ON public.students
FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
);
