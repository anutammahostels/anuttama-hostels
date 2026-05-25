
-- 1. Allow students/parents to view their own attendance
CREATE POLICY "Students and parents view own attendance"
ON public.attendance FOR SELECT TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students
    WHERE user_id = auth.uid() OR parent_id = auth.uid()
  )
);

-- 2. Tighten properties SELECT: drop blanket policy, allow staff + linked students/parents
DROP POLICY IF EXISTS "Authenticated users can view properties" ON public.properties;

CREATE POLICY "Staff and linked users view properties"
ON public.properties FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR has_role(auth.uid(), 'warden'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'security_guard'::app_role)
  OR owner_id = auth.uid()
  OR id IN (
    SELECT b.room_id FROM public.beds b -- placeholder, will be replaced via floors
    WHERE false
  )
  OR EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.beds b ON b.student_id = s.id
    JOIN public.rooms r ON r.id = b.room_id
    JOIN public.floors f ON f.id = r.floor_id
    JOIN public.blocks bl ON bl.id = f.block_id
    WHERE bl.property_id = properties.id
      AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
  )
);

-- 3. Tighten rooms SELECT: drop blanket, allow staff + the student's assigned room
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.rooms;

CREATE POLICY "Staff and assigned student view rooms"
ON public.rooms FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR has_role(auth.uid(), 'warden'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'security_guard'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.beds b
    JOIN public.students s ON s.id = b.student_id
    WHERE b.room_id = rooms.id
      AND (s.user_id = auth.uid() OR s.parent_id = auth.uid())
  )
);

-- 4. Remove student self-insert on payments (payments must be admin/edge-function only)
DROP POLICY IF EXISTS "Students can insert own payments" ON public.payments;
