
-- Fix infinite recursion: beds.manage joined rooms, rooms.select joined beds → cycle.
-- Also remove leftover 'warden' role references (role no longer exists in app).

DROP POLICY IF EXISTS "Admins can manage beds" ON public.beds;
CREATE POLICY "Admins can manage beds" ON public.beds
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tenant_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tenant_admin'::app_role));

DROP POLICY IF EXISTS "Staff and assigned student view rooms" ON public.rooms;
CREATE POLICY "Staff and assigned student view rooms" ON public.rooms
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'security_guard'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.floors f ON f.id = rooms.floor_id
    JOIN public.blocks b ON b.id = f.block_id
    WHERE s.property_id = b.property_id
      AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
  )
);

-- Clean up leftover warden references on students policies
DROP POLICY IF EXISTS "Admins and staff can view students" ON public.students;
CREATE POLICY "Admins and staff can view students" ON public.students
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id))
  OR user_id = auth.uid()
  OR parent_id = auth.uid()
);

DROP POLICY IF EXISTS "Admins and wardens can manage students" ON public.students;
CREATE POLICY "Admins can manage students" ON public.students
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tenant_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tenant_admin'::app_role));
