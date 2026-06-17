DO $$
BEGIN
  -- Recreate read policy to explicitly allow Master to read Pendente statuses globally
  DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
  CREATE POLICY "Users can read profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (get_user_role() = 'Master' AND status = 'Pendente')
    );

  -- Recreate update policy to allow Master to approve Pendente profiles
  DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
  CREATE POLICY "Users can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (get_user_role() = 'Master' AND status = 'Pendente')
    )
    WITH CHECK (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR get_user_role() = 'Master'
    );
END $$;
