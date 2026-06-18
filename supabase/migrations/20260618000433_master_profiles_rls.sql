DO $block$
BEGIN
  -- Drop existing policies to ensure idempotency and avoid conflicts
  DROP POLICY IF EXISTS "Master user can view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;

  -- Create read policy
  CREATE POLICY "Users can read profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid() 
      OR ((get_user_role() IN ('Administrador', 'Master')) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    );

  -- Create update policy
  CREATE POLICY "Users can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid() 
      OR ((get_user_role() IN ('Administrador', 'Master')) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    )
    WITH CHECK (
      id = auth.uid() 
      OR ((get_user_role() IN ('Administrador', 'Master')) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    );

  -- Create delete policy
  CREATE POLICY "Users can delete profiles" ON public.profiles
    FOR DELETE TO authenticated
    USING (
      ((get_user_role() IN ('Administrador', 'Master')) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    );

  -- Create insert policy
  CREATE POLICY "Users can insert profiles" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (
      id = auth.uid() 
      OR ((get_user_role() IN ('Administrador', 'Master')) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    );
END $block$;
