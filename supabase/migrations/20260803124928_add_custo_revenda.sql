ALTER TABLE public.monthly_metrics ADD COLUMN IF NOT EXISTS custo_revenda numeric NOT NULL DEFAULT 0;
