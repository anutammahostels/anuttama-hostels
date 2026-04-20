-- HDFC Production Security Hardening: payment_transactions and payment_logs

-- payment_transactions: server-side source of truth for HDFC verification
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  payment_id UUID,
  invoice_id UUID,
  customer_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'INITIATED',
  hdfc_txn_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_transactions_status_check CHECK (status IN ('INITIATED','PENDING','SUCCESS','FAILED','TAMPERED'))
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON public.payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON public.payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_id ON public.payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Admins manage everything
CREATE POLICY "Admins manage payment_transactions"
  ON public.payment_transactions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden'));

-- Accountants can view
CREATE POLICY "Accountants view payment_transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'accountant'));

-- Students can view their own (matched via invoice -> student -> user_id)
CREATE POLICY "Students view own payment_transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT i.id FROM public.invoices i
      JOIN public.students s ON s.id = i.student_id
      WHERE s.user_id = auth.uid() OR s.parent_id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER trg_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payment_logs: full HDFC request/response audit trail
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  log_type TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_logs_type_check CHECK (log_type IN ('session_create','callback','status_api','webhook','refund','verify'))
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON public.payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_log_type ON public.payment_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs(created_at DESC);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs (audit trail)
CREATE POLICY "Admins view payment_logs"
  ON public.payment_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin'));
