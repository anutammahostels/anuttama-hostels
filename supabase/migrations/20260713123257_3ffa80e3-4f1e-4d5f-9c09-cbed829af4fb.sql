
CREATE OR REPLACE FUNCTION public.can_access_property(_user_id uuid, _property_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND (
    has_role(_user_id, 'super_admin')
    OR _property_id IS NULL
    OR EXISTS (SELECT 1 FROM public.staff_property_assignments WHERE user_id = _user_id AND property_id = _property_id)
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_student(_user_id uuid, _student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT has_role(_user_id, 'super_admin') OR EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = _student_id
      AND (s.property_id IS NULL OR EXISTS (
        SELECT 1 FROM public.staff_property_assignments spa WHERE spa.user_id = _user_id AND spa.property_id = s.property_id
      ))
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_invoice(_user_id uuid, _invoice_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT has_role(_user_id, 'super_admin') OR EXISTS (
    SELECT 1 FROM public.invoices i
    LEFT JOIN public.students s ON s.id = i.student_id
    WHERE i.id = _invoice_id
      AND (s.property_id IS NULL OR EXISTS (
        SELECT 1 FROM public.staff_property_assignments spa WHERE spa.user_id = _user_id AND spa.property_id = s.property_id
      ))
  )
$$;

-- STUDENTS
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Admins and staff can view students" ON public.students;
CREATE POLICY "Staff manage students in their properties" ON public.students FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND (property_id IS NULL OR public.can_access_property(auth.uid(), property_id))))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND (property_id IS NULL OR public.can_access_property(auth.uid(), property_id))));
CREATE POLICY "Staff view students in their properties" ON public.students FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin') OR user_id = auth.uid() OR parent_id = auth.uid()
  OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden') OR has_role(auth.uid(),'accountant') OR has_role(auth.uid(),'security_guard')) AND (property_id IS NULL OR public.can_access_property(auth.uid(), property_id))));

-- INVOICES
DROP POLICY IF EXISTS "Admins manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Accountants can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "View own invoices" ON public.invoices;
CREATE POLICY "Staff manage invoices in their properties" ON public.invoices FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'accountant')) AND public.can_access_invoice(auth.uid(), id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'accountant')) AND (student_id IS NULL OR public.can_access_student(auth.uid(), student_id))));
CREATE POLICY "View own invoices" ON public.invoices FOR SELECT TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid()));

-- PAYMENTS
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
DROP POLICY IF EXISTS "Accountants can view payments" ON public.payments;
CREATE POLICY "Staff manage payments in their properties" ON public.payments FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'accountant')) AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'accountant')) AND public.can_access_property(auth.uid(), property_id)));

-- REFUNDS
DROP POLICY IF EXISTS "Admins manage refunds" ON public.refunds;
DROP POLICY IF EXISTS "Accountants can view refunds" ON public.refunds;
DROP POLICY IF EXISTS "Wardens can view refunds" ON public.refunds;
CREATE POLICY "Staff manage refunds in their properties" ON public.refunds FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'accountant') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'accountant')) AND public.can_access_property(auth.uid(), property_id)));

-- PAYMENT_TRANSACTIONS
DROP POLICY IF EXISTS "Admins manage payment_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Accountants view payment_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Wardens view payment_transactions" ON public.payment_transactions;
CREATE POLICY "Staff manage payment_transactions in their properties" ON public.payment_transactions FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'accountant') OR has_role(auth.uid(),'warden')) AND (invoice_id IS NULL OR public.can_access_invoice(auth.uid(), invoice_id))))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'accountant')) AND (invoice_id IS NULL OR public.can_access_invoice(auth.uid(), invoice_id))));

-- PROPERTIES
DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Staff and linked users view properties" ON public.properties;
CREATE POLICY "Staff manage assigned properties" ON public.properties FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR owner_id = auth.uid() OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR owner_id = auth.uid() OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), id)));
CREATE POLICY "Staff and linked users view properties" ON public.properties FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin') OR owner_id = auth.uid()
  OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden') OR has_role(auth.uid(),'accountant') OR has_role(auth.uid(),'security_guard')) AND public.can_access_property(auth.uid(), id))
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.property_id = properties.id AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())));

-- BLOCKS
DROP POLICY IF EXISTS "Admins can manage blocks" ON public.blocks;
DROP POLICY IF EXISTS "Authenticated users can view blocks" ON public.blocks;
CREATE POLICY "Staff manage blocks in their properties" ON public.blocks FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)));
CREATE POLICY "Staff view blocks in their properties" ON public.blocks FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin') OR public.can_access_property(auth.uid(), property_id)
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.property_id = blocks.property_id AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())));

-- FLOORS
DROP POLICY IF EXISTS "Admins can manage floors" ON public.floors;
DROP POLICY IF EXISTS "Authenticated users can view floors" ON public.floors;
CREATE POLICY "Staff manage floors in their properties" ON public.floors FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR EXISTS (SELECT 1 FROM public.blocks b WHERE b.id = floors.block_id AND has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), b.property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR EXISTS (SELECT 1 FROM public.blocks b WHERE b.id = floors.block_id AND has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), b.property_id)));
CREATE POLICY "Staff view floors in their properties" ON public.floors FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin') OR EXISTS (SELECT 1 FROM public.blocks b WHERE b.id = floors.block_id AND public.can_access_property(auth.uid(), b.property_id))
  OR EXISTS (SELECT 1 FROM public.blocks b JOIN public.students s ON s.property_id = b.property_id WHERE b.id = floors.block_id AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())));

-- ROOMS
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Staff and assigned student view rooms" ON public.rooms;
CREATE POLICY "Staff manage rooms in their properties" ON public.rooms FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR EXISTS (SELECT 1 FROM public.floors f JOIN public.blocks b ON b.id = f.block_id WHERE f.id = rooms.floor_id AND has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), b.property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR EXISTS (SELECT 1 FROM public.floors f JOIN public.blocks b ON b.id = f.block_id WHERE f.id = rooms.floor_id AND has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), b.property_id)));
CREATE POLICY "Staff and assigned student view rooms" ON public.rooms FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin')
  OR EXISTS (SELECT 1 FROM public.floors f JOIN public.blocks b ON b.id = f.block_id WHERE f.id = rooms.floor_id AND public.can_access_property(auth.uid(), b.property_id))
  OR EXISTS (SELECT 1 FROM public.beds bd JOIN public.students s ON s.id = bd.student_id WHERE bd.room_id = rooms.id AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())));

-- BEDS
DROP POLICY IF EXISTS "Admins can manage beds" ON public.beds;
DROP POLICY IF EXISTS "Staff and assigned student can view beds" ON public.beds;
CREATE POLICY "Staff manage beds in their properties" ON public.beds FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR EXISTS (SELECT 1 FROM public.rooms r JOIN public.floors f ON f.id = r.floor_id JOIN public.blocks b ON b.id = f.block_id WHERE r.id = beds.room_id AND has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), b.property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR EXISTS (SELECT 1 FROM public.rooms r JOIN public.floors f ON f.id = r.floor_id JOIN public.blocks b ON b.id = f.block_id WHERE r.id = beds.room_id AND has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), b.property_id)));
CREATE POLICY "Staff and assigned student can view beds" ON public.beds FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin')
  OR EXISTS (SELECT 1 FROM public.rooms r JOIN public.floors f ON f.id = r.floor_id JOIN public.blocks b ON b.id = f.block_id WHERE r.id = beds.room_id AND public.can_access_property(auth.uid(), b.property_id))
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = beds.student_id AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())));

-- ADMISSIONS
DROP POLICY IF EXISTS "Admins manage admissions" ON public.admissions;
DROP POLICY IF EXISTS "Staff can create admissions" ON public.admissions;
CREATE POLICY "Staff manage admissions in their properties" ON public.admissions FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)));

-- COMPLAINTS
DROP POLICY IF EXISTS "Staff can update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students can view their complaints" ON public.complaints;
CREATE POLICY "Staff manage complaints in their properties" ON public.complaints FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)));
CREATE POLICY "Students create complaints" ON public.complaints FOR INSERT TO authenticated
WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "Students view own complaints" ON public.complaints FOR SELECT TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid()));

-- MAINTENANCE_TICKETS
DROP POLICY IF EXISTS "Admins manage maintenance tickets" ON public.maintenance_tickets;
DROP POLICY IF EXISTS "Create maintenance tickets" ON public.maintenance_tickets;
DROP POLICY IF EXISTS "View maintenance tickets" ON public.maintenance_tickets;
CREATE POLICY "Staff manage maintenance in their properties" ON public.maintenance_tickets FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)));
CREATE POLICY "Create maintenance tickets" ON public.maintenance_tickets FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "View maintenance tickets" ON public.maintenance_tickets FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin') OR public.can_access_property(auth.uid(), property_id) OR reported_by = auth.uid());

-- GATE_PASSES
DROP POLICY IF EXISTS "Wardens can manage gate passes" ON public.gate_passes;
DROP POLICY IF EXISTS "View own or managed gate passes" ON public.gate_passes;
DROP POLICY IF EXISTS "Students can create gate passes" ON public.gate_passes;
CREATE POLICY "Staff manage gate passes in their properties" ON public.gate_passes FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden') OR has_role(auth.uid(),'security_guard')) AND public.can_access_student(auth.uid(), student_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_student(auth.uid(), student_id)));
CREATE POLICY "Students create gate passes" ON public.gate_passes FOR INSERT TO authenticated
WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
CREATE POLICY "View own or managed gate passes" ON public.gate_passes FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin')
  OR student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid())
  OR public.can_access_student(auth.uid(), student_id));

-- ATTENDANCE
DROP POLICY IF EXISTS "Staff can mark attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Staff can view attendance for their properties" ON public.attendance;
DROP POLICY IF EXISTS "Students and parents view own attendance" ON public.attendance;
CREATE POLICY "Staff manage attendance in their properties" ON public.attendance FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)));
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid()));

-- MESS_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Admins manage mess subscriptions" ON public.mess_subscriptions;
DROP POLICY IF EXISTS "View own mess subscriptions" ON public.mess_subscriptions;
CREATE POLICY "Staff manage mess subs in their properties" ON public.mess_subscriptions FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_student(auth.uid(), student_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_student(auth.uid(), student_id)));
CREATE POLICY "View own mess subscriptions" ON public.mess_subscriptions FOR SELECT TO authenticated
USING (has_role(auth.uid(),'super_admin')
  OR student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid())
  OR public.can_access_student(auth.uid(), student_id));

-- EMPLOYEES
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Accountants can view employees" ON public.employees;
CREATE POLICY "Staff manage employees in their properties" ON public.employees FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)));
CREATE POLICY "Accountants view employees in their properties" ON public.employees FOR SELECT TO authenticated
USING (has_role(auth.uid(),'accountant') AND public.can_access_property(auth.uid(), property_id));

-- PAYROLL
DROP POLICY IF EXISTS "Admins can manage payroll" ON public.payroll_records;
CREATE POLICY "Staff manage payroll in their properties" ON public.payroll_records FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)));

-- ACCOUNTS
DROP POLICY IF EXISTS "Admins manage accounts" ON public.accounts;
CREATE POLICY "Staff manage accounts in their properties" ON public.accounts FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)));

-- NOTICES
DROP POLICY IF EXISTS "Staff can create notices" ON public.notices;
DROP POLICY IF EXISTS "Staff can update notices" ON public.notices;
DROP POLICY IF EXISTS "Staff can delete notices" ON public.notices;
CREATE POLICY "Staff manage notices in their properties" ON public.notices FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR ((has_role(auth.uid(),'tenant_admin') OR has_role(auth.uid(),'warden')) AND public.can_access_property(auth.uid(), property_id)));

-- POLICY_SETTINGS
DROP POLICY IF EXISTS "Admins can manage all policy settings" ON public.policy_settings;
DROP POLICY IF EXISTS "Property owners can manage policy settings" ON public.policy_settings;
CREATE POLICY "Staff manage policy settings in their properties" ON public.policy_settings FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin')
  OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id))
  OR property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()))
WITH CHECK (has_role(auth.uid(),'super_admin')
  OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id))
  OR property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid()));

-- STAFF_PROPERTY_ASSIGNMENTS
DROP POLICY IF EXISTS "Admins manage staff assignments" ON public.staff_property_assignments;
CREATE POLICY "Staff assignments management" ON public.staff_property_assignments FOR ALL TO authenticated
USING (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)))
WITH CHECK (has_role(auth.uid(),'super_admin') OR (has_role(auth.uid(),'tenant_admin') AND public.can_access_property(auth.uid(), property_id)));
