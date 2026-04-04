

## Fix: Delete Auth Account When Removing a Student

### Problem
The current `deleteStudent` flow only deletes the row from `public.students` and vacates the bed. The auth user account in auth.users remains intact, meaning a deleted student can still log in with their Form No credentials.

### Solution
Create an Edge Function `delete-student` that:
1. Accepts the `student_id` (primary key from `students` table)
2. Looks up the `user_id` from the `students` table
3. Vacates any assigned bed
4. Deletes the `students` row
5. Deletes the `user_roles` entry
6. Deletes the `profiles` entry
7. Deletes the auth user via `adminClient.auth.admin.deleteUser(user_id)` — this requires the service role key, which is why it must be an Edge Function

### Changes

**1. Create `supabase/functions/delete-student/index.ts`**
- Accepts `{ student_id: string }` in the request body
- Validates JWT to ensure caller is admin/warden
- Looks up student's `user_id`
- Vacates bed, deletes student record, user_roles, profile, and auth user
- Returns success/error response with CORS headers

**2. Update `src/hooks/useStudents.ts`**
- Replace the current `deleteStudent` mutation (which does client-side deletes) with a call to `supabase.functions.invoke('delete-student', { body: { student_id } })`
- Remove the manual bed vacating logic (now handled server-side)

**3. Update bulk delete in `src/pages/Students.tsx`**
- Ensure the bulk delete loop also uses the new edge function

### Result
When a student is deleted, their login credentials are fully removed. They will no longer be able to authenticate.

