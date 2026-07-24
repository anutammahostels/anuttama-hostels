UPDATE public.refunds
SET status = 'pending'
WHERE id IN (
  SELECT r.id FROM public.refunds r
  JOIN public.students s ON s.id = r.student_id
  WHERE s.roll_number = '2461307000'
);