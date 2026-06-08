-- Migration to enforce strict data separation by project_id (CNPJ)
-- It reassigns any orphaned/incorrectly tagged records back to their owner's correct app_name
-- and drops/recreates all RLS policies to be absolutely airtight.

-- 1. Fix data records where project_id does not match the user's profile app_name
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, app_name FROM public.profiles WHERE app_name IS NOT NULL
  LOOP
    -- Update transactions
    UPDATE public.transactions
    SET project_id = r.app_name
    WHERE user_id = r.id AND project_id != r.app_name;

    -- Fix monthly_metrics if there's a mismatch.
    -- We must avoid unique constraint violation on (user_id, project_id, year, month).
    DELETE FROM public.monthly_metrics mm1
    WHERE user_id = r.id AND project_id != r.app_name 
      AND EXISTS (
        SELECT 1 FROM public.monthly_metrics mm2 
        WHERE mm2.user_id = r.id 
          AND mm2.project_id = r.app_name 
          AND mm2.year = mm1.year 
          AND mm2.month = mm1.month
      );

    -- Update monthly_metrics
    UPDATE public.monthly_metrics
    SET project_id = r.app_name
    WHERE user_id = r.id AND project_id != r.app_name;

    -- Update appointments
    UPDATE public.appointments
    SET project_id = r.app_name
    WHERE user_id = r.id AND project_id != r.app_name;

    -- Update audit_logs
    UPDATE public.audit_logs
    SET project_id = r.app_name
    WHERE user_id = r.id AND project_id != r.app_name;
    
    -- Update users (if exists in public schema)
    UPDATE public.users
    SET project_id = r.app_name
    WHERE user_id = r.id AND project_id != r.app_name;
    
    -- Fix user_settings if there's a mismatch. 
    -- We must avoid unique constraint violation on (user_id, project_id).
    DELETE FROM public.user_settings 
    WHERE user_id = r.id AND project_id != r.app_name 
      AND EXISTS (SELECT 1 FROM public.user_settings us2 WHERE us2.user_id = r.id AND us2.project_id = r.app_name);
      
    UPDATE public.user_settings
    SET project_id = r.app_name
    WHERE user_id = r.id AND project_id != r.app_name;
  END LOOP;
END $$;

-- 2. Enforce strict RLS policies to prevent any cross-tenant data access
-- Transactions
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

-- Monthly Metrics
DROP POLICY IF EXISTS "monthly_metrics_select" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics
  FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "monthly_metrics_insert" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics
  FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "monthly_metrics_update" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics
  FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "monthly_metrics_delete" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics
  FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

-- Appointments
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
CREATE POLICY "appointments_insert" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
CREATE POLICY "appointments_update" ON public.appointments
  FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;
CREATE POLICY "appointments_delete" ON public.appointments
  FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

-- Audit Logs
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "audit_logs_update" ON public.audit_logs;
CREATE POLICY "audit_logs_update" ON public.audit_logs
  FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "audit_logs_delete" ON public.audit_logs;
CREATE POLICY "audit_logs_delete" ON public.audit_logs
  FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

-- User Settings
DROP POLICY IF EXISTS "user_settings_select" ON public.user_settings;
CREATE POLICY "user_settings_select" ON public.user_settings
  FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "user_settings_insert" ON public.user_settings;
CREATE POLICY "user_settings_insert" ON public.user_settings
  FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "user_settings_update" ON public.user_settings;
CREATE POLICY "user_settings_update" ON public.user_settings
  FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "user_settings_delete" ON public.user_settings;
CREATE POLICY "user_settings_delete" ON public.user_settings
  FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

-- Users Table (if public.users exists and has RLS)
DROP POLICY IF EXISTS "Users can read their own project users" ON public.users;
DROP POLICY IF EXISTS "users_select" ON public.users;
CREATE POLICY "users_select" ON public.users
  FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can insert into their own project" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
CREATE POLICY "users_insert" ON public.users
  FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can update their own project users" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
CREATE POLICY "users_update" ON public.users
  FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can delete their own project users" ON public.users;
DROP POLICY IF EXISTS "users_delete" ON public.users;
CREATE POLICY "users_delete" ON public.users
  FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());
