DO $$
BEGIN
  -- Transactions Policies
  DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
  CREATE POLICY "Users can read own transactions" ON public.transactions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'Administrador');

  DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
  CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'Administrador')
    WITH CHECK (user_id = auth.uid() OR public.get_user_role() = 'Administrador');

  DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
  CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'Administrador');

  -- Monthly Metrics Policies
  DROP POLICY IF EXISTS "Users can read own monthly metrics" ON public.monthly_metrics;
  CREATE POLICY "Users can read own monthly metrics" ON public.monthly_metrics
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'Administrador');

  DROP POLICY IF EXISTS "Users can update own monthly metrics" ON public.monthly_metrics;
  CREATE POLICY "Users can update own monthly metrics" ON public.monthly_metrics
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'Administrador')
    WITH CHECK (user_id = auth.uid() OR public.get_user_role() = 'Administrador');

  DROP POLICY IF EXISTS "Users can delete own monthly metrics" ON public.monthly_metrics;
  CREATE POLICY "Users can delete own monthly metrics" ON public.monthly_metrics
    FOR DELETE TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'Administrador');

  -- User Settings Policies
  DROP POLICY IF EXISTS "Users can read own user settings" ON public.user_settings;
  CREATE POLICY "Users can read own user settings" ON public.user_settings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'Administrador');

  DROP POLICY IF EXISTS "Users can update own user settings" ON public.user_settings;
  CREATE POLICY "Users can update own user settings" ON public.user_settings
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid() OR public.get_user_role() = 'Administrador')
    WITH CHECK (user_id = auth.uid() OR public.get_user_role() = 'Administrador');

END $$;
