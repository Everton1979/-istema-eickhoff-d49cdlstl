DO $$
BEGIN
  -- Add project_id columns with default 'planilha' to keep existing data in this scope
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS project_id text NOT NULL DEFAULT 'planilha';
  ALTER TABLE public.monthly_metrics ADD COLUMN IF NOT EXISTS project_id text NOT NULL DEFAULT 'planilha';
  ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS project_id text NOT NULL DEFAULT 'planilha';
  ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS project_id text NOT NULL DEFAULT 'planilha';
  ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS project_id text NOT NULL DEFAULT 'planilha';
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_settings_pkey' 
      AND pg_get_constraintdef(oid) LIKE '%project_id%'
  ) THEN
    ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_pkey CASCADE;
    ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_pkey PRIMARY KEY (user_id, project_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'monthly_metrics_user_id_month_year_project_key'
  ) THEN
    ALTER TABLE public.monthly_metrics DROP CONSTRAINT IF EXISTS monthly_metrics_user_id_month_year_key CASCADE;
    ALTER TABLE public.monthly_metrics ADD CONSTRAINT monthly_metrics_user_id_month_year_project_key UNIQUE (user_id, month, year, project_id);
  END IF;
END $$;
