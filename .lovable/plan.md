

## Preserve Refund Records After Student Deletion

### Problem
The recent migration added `ON DELETE CASCADE` to `refunds.student_id`, which deletes all refund records when a student is removed. This breaks the accounting requirement — all financial transactions (including refunds) must remain visible in the Accounting tab regardless of student status.

### Solution
1. **Database migration**: Drop the CASCADE constraint, make `student_id` nullable, and re-add the foreign key with `ON DELETE SET NULL`. This keeps the refund row intact with a `NULL` student reference after deletion.

2. **Update Accounting/Billing UI**: Where refund records display student names, handle the `null` student case gracefully (show "Deleted Student" or similar fallback).

### Files to Change

| File | Change |
|------|--------|
| DB migration | Alter `refunds.student_id` to nullable + `ON DELETE SET NULL` |
| `src/pages/Accounting.tsx` | Handle null student references in refund display |
| `src/pages/Billing.tsx` | Handle null student references in refund/transaction lists |

### Migration SQL
```sql
ALTER TABLE public.refunds ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE public.refunds DROP CONSTRAINT refunds_student_id_fkey;
ALTER TABLE public.refunds ADD CONSTRAINT refunds_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;
```

