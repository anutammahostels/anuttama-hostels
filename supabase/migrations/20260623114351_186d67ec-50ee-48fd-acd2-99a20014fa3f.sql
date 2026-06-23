
-- admissions
DROP POLICY IF EXISTS "Admins manage admissions" ON public.admissions;
CREATE POLICY "Admins manage admissions" ON public.admissions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

DROP POLICY IF EXISTS "Staff can create admissions" ON public.admissions;
CREATE POLICY "Staff can create admissions" ON public.admissions
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

-- blocks
DROP POLICY IF EXISTS "Admins can manage blocks" ON public.blocks;
CREATE POLICY "Admins can manage blocks" ON public.blocks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

-- complaints
DROP POLICY IF EXISTS "Staff can update complaints" ON public.complaints;
CREATE POLICY "Staff can update complaints" ON public.complaints
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

-- floors
DROP POLICY IF EXISTS "Admins can manage floors" ON public.floors;
CREATE POLICY "Admins can manage floors" ON public.floors
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

-- maintenance_tickets
DROP POLICY IF EXISTS "View maintenance tickets" ON public.maintenance_tickets;
CREATE POLICY "View maintenance tickets" ON public.maintenance_tickets
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'tenant_admin')
    OR reported_by = auth.uid()
  );

DROP POLICY IF EXISTS "Admins manage maintenance tickets" ON public.maintenance_tickets;
CREATE POLICY "Admins manage maintenance tickets" ON public.maintenance_tickets
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

-- notices
DROP POLICY IF EXISTS "Staff can create notices" ON public.notices;
CREATE POLICY "Staff can create notices" ON public.notices
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

-- payments
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

-- profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

DROP POLICY IF EXISTS "Profiles visible to self, admins, wardens, linked parents" ON public.profiles;
CREATE POLICY "Profiles visible to self, admins, linked parents" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'tenant_admin')
    OR EXISTS (SELECT 1 FROM students s WHERE s.user_id = profiles.id AND s.parent_id = auth.uid())
  );

-- rooms
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'tenant_admin'));

DROP POLICY IF EXISTS "Staff and assigned student view rooms" ON public.rooms;
CREATE POLICY "Staff and assigned student view rooms" ON public.rooms
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'super_admin')
    OR has_role(auth.uid(),'tenant_admin')
    OR has_role(auth.uid(),'accountant')
    OR has_role(auth.uid(),'security_guard')
    OR EXISTS (
      SELECT 1 FROM beds b JOIN students s ON s.id = b.student_id
      WHERE b.room_id = rooms.id AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
    )
  );

-- Revoke EXECUTE on internal SECURITY DEFINER functions from public/anon
REVOKE EXECUTE ON FUNCTION public.enforce_payment_rules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_reconcile_invoice() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reconcile_invoice(uuid) FROM PUBLIC, anon, authenticated;
