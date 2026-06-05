-- Fix RLS policies to allow users within the same project to see each other's data
-- This prevents data silos for transactions, monthly_metrics, and user_settings

DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Users can manage monthly metrics" ON public.monthly_metrics
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
CREATE POLICY "Users can manage transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can manage user settings" ON public.user_settings;
CREATE POLICY "Users can manage user settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());
