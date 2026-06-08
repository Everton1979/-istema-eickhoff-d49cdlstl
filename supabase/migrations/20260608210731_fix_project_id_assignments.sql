DO $$
DECLARE
  v_marcela_id uuid;
  v_farmacia_id uuid;
BEGIN
  -- 1. Identify affected users
  SELECT id INTO v_marcela_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br';
  SELECT id INTO v_farmacia_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';

  -- 2. Update profiles to map correctly to their CNPJ/project_id (Tenant ID)
  IF v_marcela_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET app_name = '02671419000109' 
    WHERE id = v_marcela_id;
  END IF;

  IF v_farmacia_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET app_name = '30765609000112' 
    WHERE id = v_farmacia_id;
  END IF;

  -- 3. Data Re-assignment: Move misplaced records back to Marcela's project_id
  IF v_marcela_id IS NOT NULL THEN
    
    -- Transactions (Migrate approx 1,565 records)
    UPDATE public.transactions 
    SET project_id = '02671419000109' 
    WHERE user_id = v_marcela_id 
      AND project_id = '30765609000112';

    -- Monthly Metrics
    -- Safely update records (including March, April, May, June 2026) avoiding unique constraint violations
    UPDATE public.monthly_metrics mm
    SET project_id = '02671419000109'
    WHERE mm.user_id = v_marcela_id 
      AND mm.project_id = '30765609000112'
      AND NOT EXISTS (
        SELECT 1 FROM public.monthly_metrics mm2
        WHERE mm2.project_id = '02671419000109'
          AND mm2.year = mm.year
          AND mm2.month = mm.month
      );

    -- Delete any remaining monthly metrics for Marcela that were stuck in Farmacia's project
    -- (i.e. those that conflicted and couldn't be updated, causing inflation)
    DELETE FROM public.monthly_metrics
    WHERE user_id = v_marcela_id 
      AND project_id = '30765609000112';

    -- Appointments
    UPDATE public.appointments a
    SET project_id = '02671419000109'
    WHERE a.user_id = v_marcela_id 
      AND a.project_id = '30765609000112'
      AND NOT EXISTS (
        SELECT 1 FROM public.appointments a2
        WHERE a2.project_id = '02671419000109'
          AND a2.date = a.date
      );

    DELETE FROM public.appointments
    WHERE user_id = v_marcela_id 
      AND project_id = '30765609000112';

    -- Audit Logs
    UPDATE public.audit_logs 
    SET project_id = '02671419000109' 
    WHERE user_id = v_marcela_id 
      AND project_id = '30765609000112';

    -- User Settings
    UPDATE public.user_settings
    SET project_id = '02671419000109'
    WHERE user_id = v_marcela_id 
      AND project_id = '30765609000112'
      AND NOT EXISTS (
        SELECT 1 FROM public.user_settings 
        WHERE user_id = v_marcela_id AND project_id = '02671419000109'
      );

    DELETE FROM public.user_settings
    WHERE user_id = v_marcela_id 
      AND project_id = '30765609000112';

  END IF;
END $$;

-- 4. Schema Hardening: Remove the hardcoded default project_id to prevent future cross-tenant data leaks
ALTER TABLE public.profiles ALTER COLUMN app_name DROP DEFAULT;
ALTER TABLE public.transactions ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE public.monthly_metrics ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE public.appointments ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE public.audit_logs ALTER COLUMN project_id DROP DEFAULT;
ALTER TABLE public.user_settings ALTER COLUMN project_id DROP DEFAULT;
