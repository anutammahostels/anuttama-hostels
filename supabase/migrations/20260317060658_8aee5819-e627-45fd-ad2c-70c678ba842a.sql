
-- Fix beds.student_id to reference students table instead of auth.users
ALTER TABLE public.beds DROP CONSTRAINT beds_student_id_fkey;
ALTER TABLE public.beds ADD CONSTRAINT beds_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;
