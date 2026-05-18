## Goal
Wipe all student data and related records, but first create a single test student so you can keep testing.

## Step 1 — Create test student (via create-student edge function)
- Form Number: `TESTSTUDENT1`
- Password: `5c63bd64-4c0A1!`
- Email: `TESTSTUDENT1@anuttama.student`
- Attached to first available property; bed allocation skipped (free to assign later)

## Step 2 — Wipe everyone else (single SQL migration)
For every student where `roll_number != 'TESTSTUDENT1'`:

**Financial records (deleted):**
- `payment_logs` (by order_id linked to wiped transactions)
- `payment_transactions`
- `payments`
- `refunds`
- `invoices`

**Operational records (deleted):**
- `gate_passes`
- `complaints`
- `maintenance_tickets` (reported by these students)
- `attendance`
- `mess_subscriptions`
- `admissions` (all rows — they're pre-enrollment)
- `notifications` (for these student user_ids)

**Bed reset:**
- `UPDATE beds SET status='vacant', student_id=NULL` where occupied by wiped students

**Students + Auth:**
- DELETE from `students`
- DELETE from `user_roles` (student rows)
- DELETE from `profiles` (student rows)

## Step 3 — Wipe orphaned auth accounts
Re-run the existing `bulk-delete-students` edge function to remove leftover `*@anuttama.student` users from `auth.users` (keeps TESTSTUDENT1 because it has a `user_roles` entry).

## What's preserved
- TESTSTUDENT1 student + login
- All staff (admins, wardens, accountants), employees, payroll
- Property structure (blocks, floors, rooms, beds metadata)
- Policy settings, mess plans, accounts, notices
