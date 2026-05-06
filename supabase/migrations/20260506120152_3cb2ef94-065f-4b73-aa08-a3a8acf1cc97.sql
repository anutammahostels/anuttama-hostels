
-- Identify student user_ids to wipe (everyone except TESTSTUDENT1)
WITH wipe_students AS (
  SELECT id, user_id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1'
),
wipe_invoices AS (
  SELECT id FROM public.invoices WHERE student_id IN (SELECT id FROM wipe_students)
),
wipe_orders AS (
  SELECT order_id FROM public.payment_transactions WHERE invoice_id IN (SELECT id FROM wipe_invoices)
)
DELETE FROM public.payment_logs WHERE order_id IN (SELECT order_id FROM wipe_orders);

DELETE FROM public.payment_transactions
  WHERE invoice_id IN (SELECT id FROM public.invoices WHERE student_id IN
    (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1'));

DELETE FROM public.payments
  WHERE student_id IN (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

DELETE FROM public.refunds
  WHERE student_id IN (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

DELETE FROM public.invoices
  WHERE student_id IN (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

DELETE FROM public.gate_passes
  WHERE student_id IN (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

DELETE FROM public.complaints
  WHERE student_id IN (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

DELETE FROM public.maintenance_tickets
  WHERE reported_by IN (SELECT user_id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

DELETE FROM public.attendance
  WHERE student_id IN (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

DELETE FROM public.mess_subscriptions
  WHERE student_id IN (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

-- Wipe all admissions (pre-enrollment data, fresh start)
DELETE FROM public.admissions;

DELETE FROM public.notifications
  WHERE user_id IN (SELECT user_id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

-- Free beds occupied by these students
UPDATE public.beds
  SET status = 'vacant', student_id = NULL
  WHERE student_id IN (SELECT id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1');

-- Capture student user_ids before deleting students
CREATE TEMP TABLE _wipe_user_ids ON COMMIT DROP AS
  SELECT user_id FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1';

-- Delete student rows
DELETE FROM public.students WHERE roll_number IS DISTINCT FROM 'TESTSTUDENT1';

-- Delete student user_roles
DELETE FROM public.user_roles
  WHERE role = 'student' AND user_id IN (SELECT user_id FROM _wipe_user_ids);

-- Delete student profiles
DELETE FROM public.profiles
  WHERE id IN (SELECT user_id FROM _wipe_user_ids);
