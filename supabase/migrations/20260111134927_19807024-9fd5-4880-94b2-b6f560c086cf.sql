-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins manage policy settings" ON public.policy_settings;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create better policy for policy_settings that checks property ownership
CREATE POLICY "Property owners can manage policy settings" 
ON public.policy_settings 
FOR ALL 
TO authenticated
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  property_id IN (
    SELECT id FROM public.properties WHERE owner_id = auth.uid()
  )
);

-- Create policy for admins on policy_settings
CREATE POLICY "Admins can manage all policy settings" 
ON public.policy_settings 
FOR ALL 
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'tenant_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'tenant_admin'::app_role)
);

-- Fix user_roles policy - users should be able to insert their own role during signup
CREATE POLICY "Users can insert own role" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'tenant_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'tenant_admin'::app_role)
);