-- 1. Rename Main Property to Sarjapur (first center)
UPDATE public.properties
SET name = 'Sarjapur', updated_at = now()
WHERE name = 'Main Property';

-- 2. Add property_id (center) on students
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL;

-- 3. Backfill all existing students to Sarjapur
UPDATE public.students
SET property_id = (SELECT id FROM public.properties WHERE name = 'Sarjapur' LIMIT 1)
WHERE property_id IS NULL;

-- 4. Index for filter performance
CREATE INDEX IF NOT EXISTS idx_students_property_id ON public.students(property_id);