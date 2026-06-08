-- Update RLS policy for transactions to allow sharing within the same company/project
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
CREATE POLICY "Users can manage transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());

-- Update RLS policy for monthly_metrics to allow sharing within the same company/project
DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Users can manage monthly metrics" ON public.monthly_metrics
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());

-- Update RLS policy for user_settings to allow sharing within the same company/project
DROP POLICY IF EXISTS "Users can manage user settings" ON public.user_settings;
CREATE POLICY "Users can manage user settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());
