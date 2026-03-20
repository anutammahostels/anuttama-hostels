
-- ==========================================
-- ACCOUNTING & AUDITING TABLES
-- ==========================================

-- Account categories for chart of accounts
CREATE TYPE public.account_type AS ENUM ('income', 'expense', 'asset', 'liability');

-- Chart of Accounts
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  account_type public.account_type NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage accounts" ON public.accounts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'tenant_admin'));

CREATE POLICY "Staff can view accounts" ON public.accounts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'warden'));

-- Financial Transactions (income & expense tracking)
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  transaction_type text NOT NULL DEFAULT 'expense' CHECK (transaction_type IN ('income', 'expense')),
  amount numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  reference_number text,
  category text,
  payment_mode text DEFAULT 'cash',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'tenant_admin'));

CREATE POLICY "Staff can view transactions" ON public.transactions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'warden'));

-- Journal Entries (double-entry bookkeeping)
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  entry_number text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  debit_account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  credit_account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  amount numeric NOT NULL DEFAULT 0,
  reference text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage journal entries" ON public.journal_entries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'tenant_admin'));

CREATE POLICY "Staff can view journal entries" ON public.journal_entries
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'warden'));

-- Audit Logs (track every change)
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'tenant_admin'));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'tenant_admin') OR has_role(auth.uid(), 'warden'));

-- ==========================================
-- ADMISSIONS TABLE
-- ==========================================
CREATE TABLE public.admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  course text,
  department text,
  year integer,
  roll_number text,
  blood_group text,
  address text,
  city text,
  state text,
  pincode text,
  parent_name text,
  parent_phone text,
  parent_email text,
  parent_relationship text DEFAULT 'father',
  parent_address text,
  room_type_preference text,
  admission_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'enrolled')),
  notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage admissions" ON public.admissions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'tenant_admin') OR has_role(auth.uid(), 'warden'));

-- Allow public insert for admission form (no auth required for applying)
CREATE POLICY "Anyone can submit admission" ON public.admissions
  FOR INSERT TO anon
  WITH CHECK (true);
