
-- EMPLOYEES: scope warden access by property
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
CREATE POLICY "Admins can manage employees"
ON public.employees FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role) AND staff_has_property_access(auth.uid(), property_id))
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR (has_role(auth.uid(), 'warden'::app_role) AND staff_has_property_access(auth.uid(), property_id))
);

-- REFUNDS: scope accountant/warden read by property
DROP POLICY IF EXISTS "Accountants can view refunds" ON public.refunds;
CREATE POLICY "Accountants can view refunds"
ON public.refunds FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id));

DROP POLICY IF EXISTS "Wardens can view refunds" ON public.refunds;
CREATE POLICY "Wardens can view refunds"
ON public.refunds FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'warden'::app_role) AND staff_has_property_access(auth.uid(), property_id));

-- TRANSACTIONS: scope accountant manage by property
DROP POLICY IF EXISTS "Accountants can manage transactions" ON public.transactions;
CREATE POLICY "Accountants can manage transactions"
ON public.transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id))
WITH CHECK (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id));

-- ACCOUNTS: scope accountant manage + warden view by property
DROP POLICY IF EXISTS "Accountants can manage accounts" ON public.accounts;
CREATE POLICY "Accountants can manage accounts"
ON public.accounts FOR ALL TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id))
WITH CHECK (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id));

DROP POLICY IF EXISTS "Staff can view accounts" ON public.accounts;
CREATE POLICY "Staff can view accounts"
ON public.accounts FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'warden'::app_role) AND staff_has_property_access(auth.uid(), property_id));

-- JOURNAL ENTRIES: scope by property
DROP POLICY IF EXISTS "Accountants can manage journal entries" ON public.journal_entries;
CREATE POLICY "Accountants can manage journal entries"
ON public.journal_entries FOR ALL TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id))
WITH CHECK (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id));

DROP POLICY IF EXISTS "Staff can view journal entries" ON public.journal_entries;
CREATE POLICY "Staff can view journal entries"
ON public.journal_entries FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'warden'::app_role) AND staff_has_property_access(auth.uid(), property_id));

-- PAYMENTS: scope accountant view by property (payments has property_id)
DROP POLICY IF EXISTS "Accountants can view payments" ON public.payments;
CREATE POLICY "Accountants can view payments"
ON public.payments FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role) AND staff_has_property_access(auth.uid(), property_id));

-- PAYMENT_TRANSACTIONS: remove warden full management, add scoped read.
-- The table has invoice_id (no direct property_id), so derive property via invoice -> student.
DROP POLICY IF EXISTS "Admins manage payment_transactions" ON public.payment_transactions;
CREATE POLICY "Admins manage payment_transactions"
ON public.payment_transactions FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
);

DROP POLICY IF EXISTS "Wardens view payment_transactions" ON public.payment_transactions;
CREATE POLICY "Wardens view payment_transactions"
ON public.payment_transactions FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'warden'::app_role)
  AND invoice_id IN (
    SELECT i.id FROM public.invoices i
    JOIN public.students s ON s.id = i.student_id
    WHERE s.property_id IS NOT NULL
      AND staff_has_property_access(auth.uid(), s.property_id)
  )
);

DROP POLICY IF EXISTS "Accountants view payment_transactions" ON public.payment_transactions;
CREATE POLICY "Accountants view payment_transactions"
ON public.payment_transactions FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'accountant'::app_role)
  AND invoice_id IN (
    SELECT i.id FROM public.invoices i
    JOIN public.students s ON s.id = i.student_id
    WHERE s.property_id IS NOT NULL
      AND staff_has_property_access(auth.uid(), s.property_id)
  )
);

-- POLICY SETTINGS: replace open SELECT
DROP POLICY IF EXISTS "View policy settings" ON public.policy_settings;
CREATE POLICY "View policy settings"
ON public.policy_settings FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'tenant_admin'::app_role)
  OR property_id IN (SELECT id FROM public.properties WHERE owner_id = auth.uid())
  OR staff_has_property_access(auth.uid(), property_id)
);

-- Revoke EXECUTE on staff_has_property_access from PUBLIC/anon
REVOKE EXECUTE ON FUNCTION public.staff_has_property_access(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.staff_has_property_access(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.staff_has_property_access(uuid, uuid) TO authenticated, service_role;
