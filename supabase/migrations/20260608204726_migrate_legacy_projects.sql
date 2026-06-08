DO $$
BEGIN
  -- 1. Update transactions
  UPDATE public.transactions
  SET project_id = '30765609000112'
  WHERE project_id IN ('02671419000109', '95360867000');

  -- 2. Update appointments
  UPDATE public.appointments
  SET project_id = '30765609000112'
  WHERE project_id IN ('02671419000109', '95360867000');

  -- 3. Update audit_logs
  UPDATE public.audit_logs
  SET project_id = '30765609000112'
  WHERE project_id IN ('02671419000109', '95360867000');

  -- 4. Update users table
  UPDATE public.users
  SET project_id = '30765609000112'
  WHERE project_id IN ('02671419000109', '95360867000');

  -- 5. Update user_settings (Handling PK constraint user_id, project_id)
  -- Migrate 02671419000109 safely without overlapping
  UPDATE public.user_settings
  SET project_id = '30765609000112'
  WHERE project_id = '02671419000109'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_settings us2
    WHERE us2.user_id = public.user_settings.user_id
    AND us2.project_id = '30765609000112'
  );

  -- Migrate 95360867000 safely without overlapping
  UPDATE public.user_settings
  SET project_id = '30765609000112'
  WHERE project_id = '95360867000'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_settings us2
    WHERE us2.user_id = public.user_settings.user_id
    AND us2.project_id = '30765609000112'
  );

  -- 6. Update monthly_metrics (Handling Unique index project_id, year, month)
  -- Migrate 02671419000109 safely without overlapping
  UPDATE public.monthly_metrics
  SET project_id = '30765609000112'
  WHERE project_id = '02671419000109'
  AND NOT EXISTS (
    SELECT 1 FROM public.monthly_metrics mm2
    WHERE mm2.project_id = '30765609000112'
    AND mm2.year = public.monthly_metrics.year
    AND mm2.month = public.monthly_metrics.month
  );

  -- Migrate 95360867000 safely without overlapping
  UPDATE public.monthly_metrics
  SET project_id = '30765609000112'
  WHERE project_id = '95360867000'
  AND NOT EXISTS (
    SELECT 1 FROM public.monthly_metrics mm2
    WHERE mm2.project_id = '30765609000112'
    AND mm2.year = public.monthly_metrics.year
    AND mm2.month = public.monthly_metrics.month
  );

END $$;
