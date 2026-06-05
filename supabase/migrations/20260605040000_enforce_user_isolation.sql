-- Data cleanup: Normalize app_name in profiles to farmacia_eickhoff
UPDATE public.profiles
SET app_name = 'farmacia_eickhoff'
WHERE app_name IS NULL OR app_name != 'farmacia_eickhoff';

-- Drop and recreate RLS for transactions
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
CREATE POLICY "Users can manage transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Drop and recreate RLS for monthly_metrics
DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Users can manage monthly metrics" ON public.monthly_metrics
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Drop and recreate RLS for appointments
DROP POLICY IF EXISTS "Users can manage appointments" ON public.appointments;
CREATE POLICY "Users can manage appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Drop and recreate RLS for user_settings
DROP POLICY IF EXISTS "Users can manage user settings" ON public.user_settings;
CREATE POLICY "Users can manage user settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
