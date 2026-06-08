-- Update set_project_id trigger function to be absolutely strict based on user_id
CREATE OR REPLACE FUNCTION public.set_project_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Force project_id to match the user's app_name based on their user_id
  SELECT COALESCE(NULLIF(app_name, ''), id::text)
  INTO NEW.project_id
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NEW.project_id IS NULL THEN
    NEW.project_id := NEW.user_id::text;
  END IF;

  RETURN NEW;
END;
$function$;

-- Data Ownership Audit & Correction
DO $$
BEGIN
  -- Re-assign/correct project_id for transactions based on the creator's identity (user_id)
  UPDATE public.transactions t
  SET project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text)
  FROM public.profiles p
  WHERE t.user_id = p.id AND t.project_id != COALESCE(NULLIF(p.app_name, ''), p.id::text);

  -- Correct monthly_metrics
  UPDATE public.monthly_metrics m
  SET project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text)
  FROM public.profiles p
  WHERE m.user_id = p.id AND m.project_id != COALESCE(NULLIF(p.app_name, ''), p.id::text);

  -- Correct appointments
  UPDATE public.appointments a
  SET project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text)
  FROM public.profiles p
  WHERE a.user_id = p.id AND a.project_id != COALESCE(NULLIF(p.app_name, ''), p.id::text);
END $$;

-- Strict Data Isolation (RLS Hardening)
-- Update RLS policies to use user_id = auth.uid() as the primary filter

-- Transactions
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Monthly Metrics
DROP POLICY IF EXISTS "monthly_metrics_select" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "monthly_metrics_insert" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "monthly_metrics_update" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "monthly_metrics_delete" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Appointments
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
CREATE POLICY "appointments_select" ON public.appointments FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;
CREATE POLICY "appointments_delete" ON public.appointments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- User Settings
DROP POLICY IF EXISTS "user_settings_select" ON public.user_settings;
CREATE POLICY "user_settings_select" ON public.user_settings FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_settings_insert" ON public.user_settings;
CREATE POLICY "user_settings_insert" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_settings_update" ON public.user_settings;
CREATE POLICY "user_settings_update" ON public.user_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_settings_delete" ON public.user_settings;
CREATE POLICY "user_settings_delete" ON public.user_settings FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Audit Logs
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "audit_logs_update" ON public.audit_logs;
CREATE POLICY "audit_logs_update" ON public.audit_logs FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "audit_logs_delete" ON public.audit_logs;
CREATE POLICY "audit_logs_delete" ON public.audit_logs FOR DELETE TO authenticated USING (user_id = auth.uid());
