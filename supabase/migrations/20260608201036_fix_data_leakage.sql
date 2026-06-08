-- Update get_user_app_name to fallback to user id if app_name is empty or null
CREATE OR REPLACE FUNCTION public.get_user_app_name()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(NULLIF(app_name, ''), id::text) FROM public.profiles WHERE id = auth.uid();
$$;

DO $$
BEGIN
  -- Fix transactions where project_id does not match the creator's current app_name
  -- This resolves issues where records belong to a specific CNPJ but are tagged with another project_id
  UPDATE public.transactions t
  SET project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text)
  FROM public.profiles p
  WHERE t.user_id = p.id AND t.project_id != COALESCE(NULLIF(p.app_name, ''), p.id::text);

  -- Fix monthly_metrics
  UPDATE public.monthly_metrics m
  SET project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text)
  FROM public.profiles p
  WHERE m.user_id = p.id AND m.project_id != COALESCE(NULLIF(p.app_name, ''), p.id::text);

  -- Fix appointments
  UPDATE public.appointments a
  SET project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text)
  FROM public.profiles p
  WHERE a.user_id = p.id AND a.project_id != COALESCE(NULLIF(p.app_name, ''), p.id::text);
  
  -- Fix audit_logs
  UPDATE public.audit_logs a
  SET project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text)
  FROM public.profiles p
  WHERE a.user_id = p.id AND a.project_id != COALESCE(NULLIF(p.app_name, ''), p.id::text);
END $$;

DO $$
BEGIN
  -- Fix user_settings separately to catch unique violations without rolling back previous updates
  UPDATE public.user_settings u
  SET project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text)
  FROM public.profiles p
  WHERE u.user_id = p.id AND u.project_id != COALESCE(NULLIF(p.app_name, ''), p.id::text);
EXCEPTION WHEN unique_violation THEN
  -- Ignore if fixing user_settings causes a unique violation (already exists)
  NULL;
END $$;

DO $$
BEGIN
  -- Deduplicate monthly_metrics to ensure only one record per month/year/project_id
  WITH duplicates AS (
    SELECT id,
           ROW_NUMBER() OVER(PARTITION BY project_id, year, month ORDER BY updated_at DESC, created_at DESC) as rn
    FROM public.monthly_metrics
  )
  DELETE FROM public.monthly_metrics
  WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
END $$;

-- Create unique index to prevent future duplicates on (project_id, year, month)
DROP INDEX IF EXISTS monthly_metrics_project_year_month_idx;
CREATE UNIQUE INDEX IF NOT EXISTS monthly_metrics_project_year_month_idx ON public.monthly_metrics USING btree (project_id, year, month);

-- Redefine policies to be absolutely sure they are strict
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT TO authenticated
  USING (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "monthly_metrics_select" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics
  FOR SELECT TO authenticated
  USING (project_id = public.get_user_app_name());
