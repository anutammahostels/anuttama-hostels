
-- Create refunds table
CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id),
  student_id uuid NOT NULL REFERENCES public.students(id),
  property_id uuid NOT NULL REFERENCES public.properties(id),
  amount numeric NOT NULL DEFAULT 0,
  reason text,
  refund_method text DEFAULT 'cash',
  status text DEFAULT 'processed',
  processed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage refunds" ON public.refunds
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'tenant_admin'::app_role));

CREATE POLICY "Wardens can view refunds" ON public.refunds
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'warden'::app_role));

-- Add new columns to employees
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS employee_number text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS work_location text;

-- Add new columns to payroll_records
ALTER TABLE public.payroll_records
  ADD COLUMN IF NOT EXISTS special_allowance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS professional_fees numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_fees numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_additions numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS incentives numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lwf numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS salary_advance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tds_194c numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tds_194j numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_days integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS lop integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS days_worked integer DEFAULT 30;
