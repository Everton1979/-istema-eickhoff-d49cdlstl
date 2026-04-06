ALTER TABLE public.monthly_metrics ADD COLUMN IF NOT EXISTS global_sales_target numeric NOT NULL DEFAULT 0;
