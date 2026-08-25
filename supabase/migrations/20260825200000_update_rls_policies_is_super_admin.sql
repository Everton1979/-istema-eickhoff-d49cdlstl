-- Migration: update RLS policies for the 5 multi-tenant tables to enforce strict user isolation with master super admin bypass
-- Tables: transactions, audit_logs, monthly_metrics, appointments, user_settings
-- Rule: USING (user_id = auth.uid() OR public.is_super_admin()) and WITH CHECK (user_id = auth.uid() OR public.is_super_admin())

-- 1. appointments
DROP POLICY IF EXISTS "user_appointments_select" ON public.appointments;
CREATE POLICY "user_appointments_select" ON public.appointments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_appointments_insert" ON public.appointments;
CREATE POLICY "user_appointments_insert" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_appointments_update" ON public.appointments;
CREATE POLICY "user_appointments_update" ON public.appointments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_appointments_delete" ON public.appointments;
CREATE POLICY "user_appointments_delete" ON public.appointments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- 2. audit_logs
DROP POLICY IF EXISTS "user_audit_logs_select" ON public.audit_logs;
CREATE POLICY "user_audit_logs_select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_audit_logs_insert" ON public.audit_logs;
CREATE POLICY "user_audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_audit_logs_update" ON public.audit_logs;
CREATE POLICY "user_audit_logs_update" ON public.audit_logs
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_audit_logs_delete" ON public.audit_logs;
CREATE POLICY "user_audit_logs_delete" ON public.audit_logs
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- 3. monthly_metrics
DROP POLICY IF EXISTS "user_monthly_metrics_select" ON public.monthly_metrics;
CREATE POLICY "user_monthly_metrics_select" ON public.monthly_metrics
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_monthly_metrics_insert" ON public.monthly_metrics;
CREATE POLICY "user_monthly_metrics_insert" ON public.monthly_metrics
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_monthly_metrics_update" ON public.monthly_metrics;
CREATE POLICY "user_monthly_metrics_update" ON public.monthly_metrics
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_monthly_metrics_delete" ON public.monthly_metrics;
CREATE POLICY "user_monthly_metrics_delete" ON public.monthly_metrics
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- 4. transactions
DROP POLICY IF EXISTS "user_transactions_select" ON public.transactions;
CREATE POLICY "user_transactions_select" ON public.transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_transactions_insert" ON public.transactions;
CREATE POLICY "user_transactions_insert" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_transactions_update" ON public.transactions;
CREATE POLICY "user_transactions_update" ON public.transactions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_transactions_delete" ON public.transactions;
CREATE POLICY "user_transactions_delete" ON public.transactions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- 5. user_settings
DROP POLICY IF EXISTS "user_settings_select" ON public.user_settings;
CREATE POLICY "user_settings_select" ON public.user_settings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_settings_insert" ON public.user_settings;
CREATE POLICY "user_settings_insert" ON public.user_settings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_settings_update" ON public.user_settings;
CREATE POLICY "user_settings_update" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_settings_delete" ON public.user_settings;
CREATE POLICY "user_settings_delete" ON public.user_settings
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());
