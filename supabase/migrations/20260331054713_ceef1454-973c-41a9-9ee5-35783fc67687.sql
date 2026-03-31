
CREATE POLICY "Accountants can manage accounts"
ON public.accounts FOR ALL TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role))
WITH CHECK (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can manage transactions"
ON public.transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role))
WITH CHECK (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can manage journal entries"
ON public.journal_entries FOR ALL TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role))
WITH CHECK (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can view properties"
ON public.properties FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can view invoices"
ON public.invoices FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can view payments"
ON public.payments FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can view payroll"
ON public.payroll_records FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can view refunds"
ON public.refunds FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can view employees"
ON public.employees FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Accountants can view notifications"
ON public.notifications FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'accountant'::app_role) AND user_id = auth.uid());
