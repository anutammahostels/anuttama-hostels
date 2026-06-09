
-- Scope accountant invoice reads by property via students table
DROP POLICY IF EXISTS "Accountants can view invoices" ON public.invoices;
CREATE POLICY "Accountants can view invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'accountant'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = invoices.student_id
      AND public.staff_has_property_access(auth.uid(), s.property_id)
  )
);

-- Restrict notices to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active notices" ON public.notices;
CREATE POLICY "Authenticated users can view active notices"
ON public.notices
FOR SELECT
TO authenticated
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Scope warden transaction reads by property assignment
DROP POLICY IF EXISTS "Staff can view transactions" ON public.transactions;
CREATE POLICY "Staff can view transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'warden'::app_role)
  AND public.staff_has_property_access(auth.uid(), property_id)
);
