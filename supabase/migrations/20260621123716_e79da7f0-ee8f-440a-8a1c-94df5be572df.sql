
-- gate_passes SELECT
DROP POLICY IF EXISTS "View own or managed gate passes" ON public.gate_passes;
CREATE POLICY "View own or managed gate passes" ON public.gate_passes
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR ((has_role(auth.uid(), 'warden'::app_role) OR has_role(auth.uid(), 'security_guard'::app_role))
      AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = gate_passes.student_id AND staff_has_property_access(auth.uid(), s.property_id)))
  OR (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid()))
);

-- gate_passes UPDATE
DROP POLICY IF EXISTS "Wardens can manage gate passes" ON public.gate_passes;
CREATE POLICY "Wardens can manage gate passes" ON public.gate_passes
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR ((has_role(auth.uid(), 'warden'::app_role) OR has_role(auth.uid(), 'security_guard'::app_role))
      AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = gate_passes.student_id AND staff_has_property_access(auth.uid(), s.property_id)))
);

-- invoices SELECT - warden scoping
DROP POLICY IF EXISTS "View own invoices" ON public.invoices;
CREATE POLICY "View own invoices" ON public.invoices
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = invoices.student_id AND staff_has_property_access(auth.uid(), s.property_id)))
  OR (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid()))
);

-- beds ALL - warden scoped via room->floor->block->property
DROP POLICY IF EXISTS "Admins can manage beds" ON public.beds;
CREATE POLICY "Admins can manage beds" ON public.beds
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND EXISTS (
        SELECT 1 FROM public.rooms r
        JOIN public.floors f ON f.id = r.floor_id
        JOIN public.blocks b ON b.id = f.block_id
        WHERE r.id = beds.room_id AND staff_has_property_access(auth.uid(), b.property_id)
      ))
) WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND EXISTS (
        SELECT 1 FROM public.rooms r
        JOIN public.floors f ON f.id = r.floor_id
        JOIN public.blocks b ON b.id = f.block_id
        WHERE r.id = beds.room_id AND staff_has_property_access(auth.uid(), b.property_id)
      ))
);

-- blocks SELECT - restrict to admin or property-assigned staff or students of that property
DROP POLICY IF EXISTS "Authenticated users can view blocks" ON public.blocks;
CREATE POLICY "Authenticated users can view blocks" ON public.blocks
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR staff_has_property_access(auth.uid(), property_id)
  OR EXISTS (SELECT 1 FROM public.students s WHERE (s.user_id = auth.uid() OR s.parent_id = auth.uid()) AND s.property_id = blocks.property_id)
);

-- floors SELECT - join via block to property
DROP POLICY IF EXISTS "Authenticated users can view floors" ON public.floors;
CREATE POLICY "Authenticated users can view floors" ON public.floors
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.blocks b
    WHERE b.id = floors.block_id AND (
      staff_has_property_access(auth.uid(), b.property_id)
      OR EXISTS (SELECT 1 FROM public.students s WHERE (s.user_id = auth.uid() OR s.parent_id = auth.uid()) AND s.property_id = b.property_id)
    )
  )
);

-- maintenance_tickets UPDATE - warden scoping by property_id
DROP POLICY IF EXISTS "Admins manage maintenance tickets" ON public.maintenance_tickets;
CREATE POLICY "Admins manage maintenance tickets" ON public.maintenance_tickets
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role) AND staff_has_property_access(auth.uid(), property_id))
);

-- mess_subscriptions ALL - warden scoped via student property
DROP POLICY IF EXISTS "Admins manage mess subscriptions" ON public.mess_subscriptions;
CREATE POLICY "Admins manage mess subscriptions" ON public.mess_subscriptions
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = mess_subscriptions.student_id AND staff_has_property_access(auth.uid(), s.property_id)))
) WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role)
      AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = mess_subscriptions.student_id AND staff_has_property_access(auth.uid(), s.property_id)))
);

-- notices SELECT - scope to user's property
DROP POLICY IF EXISTS "Authenticated users can view active notices" ON public.notices;
CREATE POLICY "Authenticated users can view active notices" ON public.notices
FOR SELECT USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'tenant_admin'::app_role)
    OR notices.property_id IS NULL
    OR staff_has_property_access(auth.uid(), notices.property_id)
    OR EXISTS (SELECT 1 FROM public.students s WHERE (s.user_id = auth.uid() OR s.parent_id = auth.uid()) AND s.property_id = notices.property_id)
  )
);
