UPDATE public.students SET status='inactive' WHERE roll_number='2461312121';
UPDATE public.invoices SET notes = COALESCE(notes,'') || CASE WHEN COALESCE(notes,'') = '' THEN '' ELSE ' | ' END || 'Cancelled admission — invoice excluded from receivables'
 WHERE student_id = (SELECT id FROM public.students WHERE roll_number='2461312121')
   AND (notes IS NULL OR notes NOT LIKE '%Cancelled admission%');