DO $$
BEGIN
  -- 1. Unify RLS Policies
  
  -- transactions
  DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
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

  -- monthly_metrics
  DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
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

  -- appointments
  DROP POLICY IF EXISTS "Users can manage appointments" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;

  CREATE POLICY "appointments_select" ON public.appointments 
    FOR SELECT TO authenticated USING (project_id = get_user_app_name());
  CREATE POLICY "appointments_insert" ON public.appointments 
    FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "appointments_update" ON public.appointments 
    FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "appointments_delete" ON public.appointments 
    FOR DELETE TO authenticated USING (project_id = get_user_app_name());

  -- user_settings
  DROP POLICY IF EXISTS "Users can manage user settings" ON public.user_settings;
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

  -- audit_logs
  DROP POLICY IF EXISTS "Users can manage audit logs" ON public.audit_logs;
  DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
  DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
  DROP POLICY IF EXISTS "audit_logs_update" ON public.audit_logs;
  DROP POLICY IF EXISTS "audit_logs_delete" ON public.audit_logs;

  CREATE POLICY "audit_logs_select" ON public.audit_logs 
    FOR SELECT TO authenticated USING (project_id = get_user_app_name());
  CREATE POLICY "audit_logs_insert" ON public.audit_logs 
    FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "audit_logs_update" ON public.audit_logs 
    FOR UPDATE TO authenticated USING (project_id = get_user_app_name()) WITH CHECK (project_id = get_user_app_name());
  CREATE POLICY "audit_logs_delete" ON public.audit_logs 
    FOR DELETE TO authenticated USING (project_id = get_user_app_name());

  -- 2. Historical Data Migration (April - June 2026)
  
  -- Specific records reassignment
  UPDATE public.transactions
  SET project_id = '02671419000109'
  WHERE project_id = '30765609000112'
    AND date >= '2026-05-31'::date AND date < '2026-06-01'::date
    AND description IN ('Prolabore', 'Compras Marcela')
    AND amount IN (16552.29, 1084.15);

  -- Scan and fix all transactions in Apr, May, Jun 2026
  UPDATE public.transactions t
  SET project_id = p.app_name
  FROM public.profiles p
  WHERE t.user_id = p.id
    AND t.date >= '2026-04-01'::date AND t.date < '2026-07-01'::date
    AND t.project_id != p.app_name
    AND p.app_name IS NOT NULL;

  -- 4. Metrics Recalculation (or Reassignment)
  UPDATE public.monthly_metrics m
  SET project_id = p.app_name
  FROM public.profiles p
  WHERE m.user_id = p.id
    AND m.year = 2026 AND m.month IN (4, 5, 6)
    AND m.project_id != p.app_name
    AND p.app_name IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.monthly_metrics m2
      WHERE m2.user_id = m.user_id
        AND m2.project_id = p.app_name
        AND m2.year = m.year
        AND m2.month = m.month
    );

END $$;
