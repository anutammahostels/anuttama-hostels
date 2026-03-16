CREATE POLICY "Super admins can delete organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));