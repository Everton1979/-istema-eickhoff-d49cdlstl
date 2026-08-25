ALTER TABLE public.monthly_metrics
ADD COLUMN IF NOT EXISTS meta_vendas_sistema_manipulacao NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS meta_vendas_sistema_revenda NUMERIC NOT NULL DEFAULT 0;
