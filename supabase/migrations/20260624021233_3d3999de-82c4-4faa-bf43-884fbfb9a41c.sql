
DROP POLICY IF EXISTS "Staff and linked users view properties" ON public.properties;

CREATE POLICY "Staff and linked users view properties"
ON public.properties
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (owner_id = auth.uid())
  OR (
    (has_role(auth.uid(), 'accountant'::app_role) OR has_role(auth.uid(), 'security_guard'::app_role))
    AND staff_has_property_access(auth.uid(), id)
  )
  OR EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.property_id = properties.id
      AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
  )
);
