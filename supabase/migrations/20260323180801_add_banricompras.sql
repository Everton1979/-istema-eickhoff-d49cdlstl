ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS initial_balance_banricompras NUMERIC DEFAULT 0;
