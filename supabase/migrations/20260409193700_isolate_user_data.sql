DO $$
BEGIN
  -- Transactions Policies
  DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
  CREATE POLICY "Users can read own transactions" ON public.transactions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
  CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
  CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

  -- Monthly Metrics Policies
  DROP POLICY IF EXISTS "Users can read own monthly metrics" ON public.monthly_metrics;
  CREATE POLICY "Users can read own monthly metrics" ON public.monthly_metrics
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can update own monthly metrics" ON public.monthly_metrics;
  CREATE POLICY "Users can update own monthly metrics" ON public.monthly_metrics
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can delete own monthly metrics" ON public.monthly_metrics;
  CREATE POLICY "Users can delete own monthly metrics" ON public.monthly_metrics
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

  -- User Settings Policies
  DROP POLICY IF EXISTS "Users can read own user settings" ON public.user_settings;
  CREATE POLICY "Users can read own user settings" ON public.user_settings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  DROP POLICY IF EXISTS "Users can update own user settings" ON public.user_settings;
  CREATE POLICY "Users can update own user settings" ON public.user_settings
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- Profiles Policies
  DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

  CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

END $$;
