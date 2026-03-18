
-- Employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  designation TEXT NOT NULL,
  department TEXT,
  date_of_joining DATE DEFAULT CURRENT_DATE,
  salary_amount NUMERIC NOT NULL DEFAULT 0,
  bank_account TEXT,
  bank_name TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tenant_admin'::app_role) OR has_role(auth.uid(), 'warden'::app_role));

CREATE POLICY "Authenticated users can view employees" ON public.employees
  FOR SELECT TO authenticated
  USING (true);

-- Payroll records table
CREATE TABLE public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  allowances NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'generated',
  notes TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payroll" ON public.payroll_records
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tenant_admin'::app_role));

CREATE POLICY "Wardens can view payroll" ON public.payroll_records
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'warden'::app_role));
