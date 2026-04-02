
-- Make invoices.student_id nullable and SET NULL on delete (preserve financial records)
ALTER TABLE public.invoices ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE public.invoices DROP CONSTRAINT invoices_student_id_fkey;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;

-- Make payments.student_id nullable and SET NULL on delete (preserve financial records)
ALTER TABLE public.payments ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE public.payments DROP CONSTRAINT payments_student_id_fkey;
ALTER TABLE public.payments ADD CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;

-- Non-financial tables: CASCADE delete
ALTER TABLE public.complaints DROP CONSTRAINT complaints_student_id_fkey;
ALTER TABLE public.complaints ADD CONSTRAINT complaints_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.gate_passes DROP CONSTRAINT gate_passes_student_id_fkey;
ALTER TABLE public.gate_passes ADD CONSTRAINT gate_passes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.attendance DROP CONSTRAINT attendance_student_id_fkey;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.mess_subscriptions DROP CONSTRAINT mess_subscriptions_student_id_fkey;
ALTER TABLE public.mess_subscriptions ADD CONSTRAINT mess_subscriptions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
