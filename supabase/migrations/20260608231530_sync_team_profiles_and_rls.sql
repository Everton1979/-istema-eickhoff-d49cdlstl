-- Drop existing policies that might conflict or use old logic
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN SELECT unnest(ARRAY['transactions', 'monthly_metrics', 'user_settings', 'appointments', 'audit_logs'])
  LOOP
    -- Drop all existing policies on these tables
    EXECUTE format('DROP POLICY IF EXISTS "%I_select" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_insert" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_update" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_delete" ON public.%I', table_name, table_name);
    
    -- Drop old user_id policies if any
    EXECUTE format('DROP POLICY IF EXISTS "Users can read own %I" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %I" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own %I" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %I" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can select own %I" ON public.%I', table_name, table_name);
  END LOOP;
END $$;

-- Create new policies relying on project_id = get_user_app_name()
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT TO authenticated USING (project_id = get_user_app_name());
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE TO authenticated USING (project_id = get_user_app_name());

CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics FOR SELECT TO authenticated USING (project_id = get_user_app_name());
CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics FOR DELETE TO authenticated USING (project_id = get_user_app_name());

CREATE POLICY "user_settings_select" ON public.user_settings FOR SELECT TO authenticated USING (project_id = get_user_app_name());
CREATE POLICY "user_settings_insert" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "user_settings_update" ON public.user_settings FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "user_settings_delete" ON public.user_settings FOR DELETE TO authenticated USING (project_id = get_user_app_name());

CREATE POLICY "appointments_select" ON public.appointments FOR SELECT TO authenticated USING (project_id = get_user_app_name());
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "appointments_delete" ON public.appointments FOR DELETE TO authenticated USING (project_id = get_user_app_name());

CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (project_id = get_user_app_name());
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "audit_logs_update" ON public.audit_logs FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
CREATE POLICY "audit_logs_delete" ON public.audit_logs FOR DELETE TO authenticated USING (project_id = get_user_app_name());

-- Sync profiles and migrate data
DO $$
DECLARE
  v_admin_id uuid;
  v_user_id uuid;
  v_admin_app_name text;
  v_user_old_app_name text;
BEGIN
  -- Get admin id
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
  -- Get user id
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br';

  IF v_admin_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    -- Get admin app_name
    SELECT COALESCE(NULLIF(app_name, ''), id::text) INTO v_admin_app_name FROM public.profiles WHERE id = v_admin_id;
    
    -- Get user old app_name
    SELECT COALESCE(NULLIF(app_name, ''), id::text) INTO v_user_old_app_name FROM public.profiles WHERE id = v_user_id;

    IF v_admin_app_name IS NOT NULL THEN
      -- Delete incorrect test data from April/May 2026 for marcela
      DELETE FROM public.transactions 
      WHERE user_id = v_user_id 
        AND date >= '2026-04-01'::date 
        AND date < '2026-06-01'::date;

      -- Delete incorrect test data with "teste" in description
      DELETE FROM public.transactions
      WHERE user_id = v_user_id
        AND description ILIKE '%teste%';

      -- Update profiles
      UPDATE public.profiles
      SET app_name = v_admin_app_name,
          status = 'Ativo',
          role = 'Master'
      WHERE id = v_user_id;

      -- Migrate transactions
      UPDATE public.transactions
      SET project_id = v_admin_app_name
      WHERE project_id IN (v_user_old_app_name, v_user_id::text);

      -- Migrate monthly_metrics (avoid unique constraint violation)
      UPDATE public.monthly_metrics m1
      SET project_id = v_admin_app_name
      WHERE m1.project_id IN (v_user_old_app_name, v_user_id::text)
        AND NOT EXISTS (
          SELECT 1 FROM public.monthly_metrics m2 
          WHERE m2.project_id = v_admin_app_name 
            AND m2.year = m1.year 
            AND m2.month = m1.month
        );
      
      -- Delete any remaining conflicting monthly_metrics
      DELETE FROM public.monthly_metrics
      WHERE project_id IN (v_user_old_app_name, v_user_id::text);

      -- Migrate user_settings (avoid unique constraint violation)
      UPDATE public.user_settings s1
      SET project_id = v_admin_app_name
      WHERE s1.project_id IN (v_user_old_app_name, v_user_id::text)
        AND NOT EXISTS (
          SELECT 1 FROM public.user_settings s2 
          WHERE s2.project_id = v_admin_app_name 
            AND s2.user_id = s1.user_id
        );
      
      -- Delete any remaining conflicting user_settings
      DELETE FROM public.user_settings
      WHERE project_id IN (v_user_old_app_name, v_user_id::text);

      -- Migrate appointments
      UPDATE public.appointments
      SET project_id = v_admin_app_name
      WHERE project_id IN (v_user_old_app_name, v_user_id::text);

      -- Migrate audit_logs
      UPDATE public.audit_logs
      SET project_id = v_admin_app_name
      WHERE project_id IN (v_user_old_app_name, v_user_id::text);
      
    END IF;
  END IF;
END $$;
