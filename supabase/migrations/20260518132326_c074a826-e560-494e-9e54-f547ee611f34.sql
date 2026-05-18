CREATE INDEX IF NOT EXISTS idx_payment_logs_order_type_created
  ON public.payment_logs (order_id, log_type, created_at DESC);