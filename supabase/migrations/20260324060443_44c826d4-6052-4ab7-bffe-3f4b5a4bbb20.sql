
ALTER TABLE public.employees 
  ADD COLUMN IF NOT EXISTS bank_ifsc text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS last_working_day date,
  ADD COLUMN IF NOT EXISTS hra numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS special_allowance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_additions numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employer_pf_contribution numeric DEFAULT 0;

ALTER TABLE public.payroll_records 
  ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;
