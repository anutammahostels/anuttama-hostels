
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS final_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_date text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS alloted_room_no text,
  ADD COLUMN IF NOT EXISTS remarks text;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payment_mode_label text,
  ADD COLUMN IF NOT EXISTS transaction_reference text,
  ADD COLUMN IF NOT EXISTS payment_label text;
