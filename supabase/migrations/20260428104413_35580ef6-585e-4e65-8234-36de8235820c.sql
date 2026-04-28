-- Step 1-11: clear operational tables
DELETE FROM public.payment_logs;
DELETE FROM public.payment_transactions;
DELETE FROM public.payments;
DELETE FROM public.refunds;
DELETE FROM public.journal_entries;
DELETE FROM public.transactions;
DELETE FROM public.payroll_records;
DELETE FROM public.invoices;
DELETE FROM public.attendance;
DELETE FROM public.gate_passes;
DELETE FROM public.complaints;
DELETE FROM public.maintenance_tickets;
DELETE FROM public.mess_subscriptions;
DELETE FROM public.admissions;
DELETE FROM public.audit_logs;

-- Step 10: Delete notifications belonging to student users only
DELETE FROM public.notifications
WHERE user_id IN (SELECT user_id FROM public.user_roles WHERE role = 'student');

-- Step 12: Vacate all beds
UPDATE public.beds SET student_id = NULL, status = 'vacant' WHERE student_id IS NOT NULL OR status <> 'vacant';

-- Step 14-16: Remove student records, profiles, and role mappings
-- Capture student user_ids in a temp table for safe reuse
CREATE TEMP TABLE _student_uids ON COMMIT DROP AS
SELECT user_id FROM public.user_roles WHERE role = 'student';

DELETE FROM public.students WHERE user_id IN (SELECT user_id FROM _student_uids);
DELETE FROM public.user_roles WHERE role = 'student';
DELETE FROM public.profiles WHERE id IN (SELECT user_id FROM _student_uids);