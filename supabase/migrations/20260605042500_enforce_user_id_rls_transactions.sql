-- Ensure strict user_id based isolation for transactions as per the Acceptance Criteria
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
CREATE POLICY "Users can manage transactions" ON public.transactions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Also enforce strict isolation for other user-specific financial tables to guarantee no data leakage
DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Users can manage monthly metrics" ON public.monthly_metrics
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage user settings" ON public.user_settings;
CREATE POLICY "Users can manage user settings" ON public.user_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
