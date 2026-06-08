DO $$
BEGIN
  -- Transactions Policies
  DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
  DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
  DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
  DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;

  CREATE POLICY "transactions_select" ON public.transactions
    FOR SELECT TO authenticated USING (project_id = get_user_app_name());
  CREATE POLICY "transactions_insert" ON public.transactions
    FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "transactions_update" ON public.transactions
    FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "transactions_delete" ON public.transactions
    FOR DELETE TO authenticated USING (project_id = get_user_app_name());

  -- Monthly Metrics Policies
  DROP POLICY IF EXISTS "monthly_metrics_select" ON public.monthly_metrics;
  DROP POLICY IF EXISTS "monthly_metrics_insert" ON public.monthly_metrics;
  DROP POLICY IF EXISTS "monthly_metrics_update" ON public.monthly_metrics;
  DROP POLICY IF EXISTS "monthly_metrics_delete" ON public.monthly_metrics;

  CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics
    FOR SELECT TO authenticated USING (project_id = get_user_app_name());
  CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics
    FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics
    FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics
    FOR DELETE TO authenticated USING (project_id = get_user_app_name());

  -- User Settings Policies
  DROP POLICY IF EXISTS "user_settings_select" ON public.user_settings;
  DROP POLICY IF EXISTS "user_settings_insert" ON public.user_settings;
  DROP POLICY IF EXISTS "user_settings_update" ON public.user_settings;
  DROP POLICY IF EXISTS "user_settings_delete" ON public.user_settings;

  CREATE POLICY "user_settings_select" ON public.user_settings
    FOR SELECT TO authenticated USING (project_id = get_user_app_name());
  CREATE POLICY "user_settings_insert" ON public.user_settings
    FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "user_settings_update" ON public.user_settings
    FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "user_settings_delete" ON public.user_settings
    FOR DELETE TO authenticated USING (project_id = get_user_app_name());
END $$;
