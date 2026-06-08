-- Re-create the get_user_app_name function just to be absolutely sure
CREATE OR REPLACE FUNCTION public.get_user_app_name()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(NULLIF(app_name, ''), id::text) FROM public.profiles WHERE id = auth.uid();
$function$
;

-- Migrate data for multi-tenancy isolation
DO $$
DECLARE
  v_farmacia_id uuid;
  v_marcela_id uuid;
  v_farmacia_old_app text;
  v_marcela_old_app text;
  v_farmacia_app_name text := 'farmacia-eickhoff';
  v_marcela_app_name text := 'marcela-ourique';
BEGIN
  -- Get user IDs
  SELECT id INTO v_farmacia_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
  SELECT id INTO v_marcela_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br';

  -- Get their old app_names
  IF v_farmacia_id IS NOT NULL THEN
    SELECT COALESCE(NULLIF(app_name, ''), id::text) INTO v_farmacia_old_app FROM public.profiles WHERE id = v_farmacia_id;
  END IF;

  IF v_marcela_id IS NOT NULL THEN
    SELECT COALESCE(NULLIF(app_name, ''), id::text) INTO v_marcela_old_app FROM public.profiles WHERE id = v_marcela_id;
  END IF;

  -- Update profiles and data for Farmacia
  IF v_farmacia_old_app IS NOT NULL AND v_farmacia_old_app != v_farmacia_app_name THEN
    -- Update all profiles in this tenant
    UPDATE public.profiles SET app_name = v_farmacia_app_name WHERE COALESCE(NULLIF(app_name, ''), id::text) = v_farmacia_old_app;
    
    -- Update data for this tenant
    UPDATE public.transactions SET project_id = v_farmacia_app_name WHERE project_id = v_farmacia_old_app;
    UPDATE public.appointments SET project_id = v_farmacia_app_name WHERE project_id = v_farmacia_old_app;
    UPDATE public.audit_logs SET project_id = v_farmacia_app_name WHERE project_id = v_farmacia_old_app;
    UPDATE public.users SET project_id = v_farmacia_app_name WHERE project_id = v_farmacia_old_app;
    
    -- Unique constraint tables
    UPDATE public.monthly_metrics mm
    SET project_id = v_farmacia_app_name
    WHERE mm.project_id = v_farmacia_old_app
      AND NOT EXISTS (
        SELECT 1 FROM public.monthly_metrics mm2 
        WHERE mm2.user_id = mm.user_id AND mm2.year = mm.year AND mm2.month = mm.month AND mm2.project_id = v_farmacia_app_name
      );
    DELETE FROM public.monthly_metrics WHERE project_id = v_farmacia_old_app;

    UPDATE public.user_settings us
    SET project_id = v_farmacia_app_name
    WHERE us.project_id = v_farmacia_old_app
      AND NOT EXISTS (
        SELECT 1 FROM public.user_settings us2 
        WHERE us2.user_id = us.user_id AND us2.project_id = v_farmacia_app_name
      );
    DELETE FROM public.user_settings WHERE project_id = v_farmacia_old_app;
  END IF;

  -- Update profiles and data for Marcela
  IF v_marcela_old_app IS NOT NULL AND v_marcela_old_app != v_marcela_app_name THEN
    UPDATE public.profiles SET app_name = v_marcela_app_name WHERE COALESCE(NULLIF(app_name, ''), id::text) = v_marcela_old_app;
    
    UPDATE public.transactions SET project_id = v_marcela_app_name WHERE project_id = v_marcela_old_app;
    UPDATE public.appointments SET project_id = v_marcela_app_name WHERE project_id = v_marcela_old_app;
    UPDATE public.audit_logs SET project_id = v_marcela_app_name WHERE project_id = v_marcela_old_app;
    UPDATE public.users SET project_id = v_marcela_app_name WHERE project_id = v_marcela_old_app;
    
    UPDATE public.monthly_metrics mm
    SET project_id = v_marcela_app_name
    WHERE mm.project_id = v_marcela_old_app
      AND NOT EXISTS (
        SELECT 1 FROM public.monthly_metrics mm2 
        WHERE mm2.user_id = mm.user_id AND mm2.year = mm.year AND mm2.month = mm.month AND mm2.project_id = v_marcela_app_name
      );
    DELETE FROM public.monthly_metrics WHERE project_id = v_marcela_old_app;

    UPDATE public.user_settings us
    SET project_id = v_marcela_app_name
    WHERE us.project_id = v_marcela_old_app
      AND NOT EXISTS (
        SELECT 1 FROM public.user_settings us2 
        WHERE us2.user_id = us.user_id AND us2.project_id = v_marcela_app_name
      );
    DELETE FROM public.user_settings WHERE project_id = v_marcela_old_app;
  END IF;

  -- Drop mistakenly created table
  DROP TABLE IF EXISTS public."marcelaourique@yahoo.com.br";
END $$;

-- Re-apply RLS strictly for the mentioned tables
DO $$
BEGIN
  -- transactions
  DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
  CREATE POLICY "transactions_select" ON public.transactions FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());
  
  DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
  CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());
  
  DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
  CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());
  
  DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
  CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

  -- monthly_metrics
  DROP POLICY IF EXISTS "monthly_metrics_select" ON public.monthly_metrics;
  CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());
  
  DROP POLICY IF EXISTS "monthly_metrics_insert" ON public.monthly_metrics;
  CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());
  
  DROP POLICY IF EXISTS "monthly_metrics_update" ON public.monthly_metrics;
  CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());
  
  DROP POLICY IF EXISTS "monthly_metrics_delete" ON public.monthly_metrics;
  CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

  -- appointments
  DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
  CREATE POLICY "appointments_select" ON public.appointments FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
  CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
  CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;
  CREATE POLICY "appointments_delete" ON public.appointments FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

  -- user_settings
  DROP POLICY IF EXISTS "user_settings_select" ON public.user_settings;
  CREATE POLICY "user_settings_select" ON public.user_settings FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "user_settings_insert" ON public.user_settings;
  CREATE POLICY "user_settings_insert" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "user_settings_update" ON public.user_settings;
  CREATE POLICY "user_settings_update" ON public.user_settings FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "user_settings_delete" ON public.user_settings;
  CREATE POLICY "user_settings_delete" ON public.user_settings FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());
  
  -- audit_logs
  DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
  CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
  CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "audit_logs_update" ON public.audit_logs;
  CREATE POLICY "audit_logs_update" ON public.audit_logs FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

  DROP POLICY IF EXISTS "audit_logs_delete" ON public.audit_logs;
  CREATE POLICY "audit_logs_delete" ON public.audit_logs FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());
END $$;
