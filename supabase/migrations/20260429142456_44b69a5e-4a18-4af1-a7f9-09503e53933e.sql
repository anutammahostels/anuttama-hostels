
-- Financials
DELETE FROM public.payment_logs;
DELETE FROM public.payment_transactions;
DELETE FROM public.payments;
DELETE FROM public.refunds;
DELETE FROM public.journal_entries;
DELETE FROM public.transactions;
DELETE FROM public.payroll_records;
DELETE FROM public.invoices;

-- Operational logs
DELETE FROM public.attendance;
DELETE FROM public.gate_passes;
DELETE FROM public.complaints;
DELETE FROM public.maintenance_tickets;
DELETE FROM public.mess_subscriptions;
DELETE FROM public.admissions;
DELETE FROM public.audit_logs;

-- Reset beds
UPDATE public.beds SET student_id = NULL, status = 'vacant' WHERE student_id IS NOT NULL OR status <> 'vacant';

-- Capture student user ids before deletion
CREATE TEMP TABLE _student_user_ids ON COMMIT DROP AS
SELECT user_id FROM public.students WHERE user_id IS NOT NULL;

-- Notifications for students only
DELETE FROM public.notifications
WHERE user_id IN (SELECT user_id FROM _student_user_ids);

-- Delete students
DELETE FROM public.students;

-- Delete student roles
DELETE FROM public.user_roles WHERE role = 'student';

-- Delete student profiles
DELETE FROM public.profiles
WHERE id IN (SELECT user_id FROM _student_user_ids)
  AND id NOT IN (SELECT user_id FROM public.user_roles);
