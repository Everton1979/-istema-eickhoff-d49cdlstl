DO $DO$
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
  CREATE POLICY "Admins can read all profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      ((auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'::text) OR
      (public.get_user_role() = 'Administrador')
    );

  DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
  CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      ((auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'::text) OR
      (public.get_user_role() = 'Administrador')
    );

  DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
  CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE TO authenticated
    USING (
      ((auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'::text) OR
      (public.get_user_role() = 'Administrador')
    );

  -- Transactions policies
  DROP POLICY IF EXISTS "Admins can read all transactions" ON public.transactions;
  CREATE POLICY "Admins can read all transactions" ON public.transactions
    FOR SELECT TO authenticated
    USING (
      ((auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'::text) OR
      (public.get_user_role() = 'Administrador')
    );

  -- Monthly Metrics policies
  DROP POLICY IF EXISTS "Admins can read all monthly metrics" ON public.monthly_metrics;
  CREATE POLICY "Admins can read all monthly metrics" ON public.monthly_metrics
    FOR SELECT TO authenticated
    USING (
      ((auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'::text) OR
      (public.get_user_role() = 'Administrador')
    );
END $DO$;
