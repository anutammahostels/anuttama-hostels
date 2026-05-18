# Fix "Unknown" student names after bulk upload

## Root cause

The uploaded Excel file (`HS_BULK_DATA_780_STD_SOFTWARE.xlsx`) is in the correct 26-column template format. The bulk upload succeeded and the student names are stored correctly in the `profiles` table.

The "Unknown" labels in the Students page are a **display bug**: `src/hooks/useStudents.ts` fetches all student profiles in a single query:

```ts
supabase.from('profiles').select('*').in('id', userIds)
```

With 664+ students, that produces a request URL of ~25 KB worth of UUIDs, exceeding the PostgREST URL length limit. The profiles query silently returns a truncated/empty set, so most rows render `student.profile?.full_name || "Unknown"`.

The same pattern is used for the `beds` lookup and will hit the same limit as the dataset grows.

## Fix

Batch the `profiles` and `beds` lookups in `src/hooks/useStudents.ts` into chunks of ~200 IDs and merge the results before mapping them onto the students list. No schema or upload changes are needed.

### Technical details

In `useStudents.ts`:

- Add a small helper `chunk<T>(arr: T[], size: number)`.
- Replace the single `profiles … .in('id', userIds)` call with `Promise.all` over chunks of 200 IDs; concatenate the rows into `profilesData`.
- Do the same for the `beds … .in('student_id', studentIds)` call.
- Keep the existing `profilesMap` / `bedsMap` and final `.map(...)` logic unchanged.

## Verification

After the change, on `/dashboard/students` with 664 students:
- Every row should show the real student name instead of "Unknown".
- Spot-check the form numbers from the screenshot (2460232917, 2460158866, 2460267822, 2460259077, 2460254774) — they should display Preetham RV, Gagan S, BHAVI JAIN, Anegondi Sreeja, BASAVAPRASAD PATIL respectively.

## Out of scope

- No changes to the bulk upload parser or template — the file format is correct.
- No changes to the `students` / `profiles` schema or RLS.
