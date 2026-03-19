-- Add detailed payroll columns to payroll_records
ALTER TABLE public.payroll_records
  ADD COLUMN IF NOT EXISTS hra numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS da numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS travel_allowance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS medical_allowance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_allowance numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pf_employee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pf_employer numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS esi_employee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS esi_employer numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS professional_tax numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tds numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_deduction numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_salary numeric DEFAULT 0;

-- Add UAN and ESI numbers to employees
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS uan_number text,
  ADD COLUMN IF NOT EXISTS esi_number text;