-- Adds structured student category + payment type columns used to
-- auto-calculate final_fee from a fixed fee matrix (see src/lib/feeMatrix.ts
-- and supabase/functions/_shared/feeMatrix.ts for the matrix itself).
CREATE TYPE public.student_category AS ENUM ('6th-10th', '11th-12th-dropper');
CREATE TYPE public.payment_type AS ENUM ('one-time', 'installment');

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS student_category public.student_category,
  ADD COLUMN IF NOT EXISTS payment_type public.payment_type;
