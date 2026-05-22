-- Permanently wipe all operational data and non-admin auth accounts.
-- Preserve only super_admin + tenant_admin (hostel owner) accounts.

DO $$
DECLARE
  keep_ids uuid[];
BEGIN
  SELECT array_agg(DISTINCT user_id) INTO keep_ids
  FROM public.user_roles
  WHERE role IN ('super_admin', 'tenant_admin');

  -- Operational / financial tables
  DELETE FROM public.payment_logs;
  DELETE FROM public.payment_transactions;
  DELETE FROM public.payments;
  DELETE FROM public.refunds;
  DELETE FROM public.invoices;
  DELETE FROM public.journal_entries;
  DELETE FROM public.transactions;
  DELETE FROM public.accounts;
  DELETE FROM public.payroll_records;
  DELETE FROM public.employees;
  DELETE FROM public.mess_subscriptions;
  DELETE FROM public.mess_plans;
  DELETE FROM public.attendance;
  DELETE FROM public.gate_passes;
  DELETE FROM public.complaints;
  DELETE FROM public.maintenance_tickets;
  DELETE FROM public.admissions;
  DELETE FROM public.notices;
  DELETE FROM public.notifications;
  DELETE FROM public.audit_logs;
  DELETE FROM public.students;
  DELETE FROM public.beds;
  DELETE FROM public.rooms;
  DELETE FROM public.floors;
  DELETE FROM public.blocks;
  DELETE FROM public.policy_settings;
  DELETE FROM public.properties;
  DELETE FROM public.organizations;

  -- Roles / profiles for non-admin users
  DELETE FROM public.user_roles WHERE user_id <> ALL(keep_ids);
  DELETE FROM public.profiles WHERE id <> ALL(keep_ids);

  -- Auth accounts for non-admins
  DELETE FROM auth.identities WHERE user_id <> ALL(keep_ids);
  DELETE FROM auth.sessions WHERE user_id <> ALL(keep_ids);
  DELETE FROM auth.refresh_tokens WHERE user_id::uuid <> ALL(keep_ids);
  DELETE FROM auth.users WHERE id <> ALL(keep_ids);
END $$;