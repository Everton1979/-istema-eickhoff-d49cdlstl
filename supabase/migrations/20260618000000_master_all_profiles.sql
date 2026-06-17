DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Ensure farmaciaeickhoff@terra.com.br is a Master and exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador", "role": "Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Ensure profile exists and role is Master
  INSERT INTO public.profiles (id, email, role, status)
  VALUES (v_user_id, 'farmaciaeickhoff@terra.com.br', 'Master', 'Ativo')
  ON CONFLICT (id) DO UPDATE SET role = 'Master';

  -- 2. Update RLS on profiles to explicitly allow the Master user / email to see everything (including status NULL)
  DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
  CREATE POLICY "Users can read profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (get_user_role() = 'Master' AND (status = 'Pendente' OR status IS NULL))
      OR get_user_role() = 'Master'
      OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    );

  DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
  CREATE POLICY "Users can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (get_user_role() = 'Master' AND (status = 'Pendente' OR status IS NULL))
      OR get_user_role() = 'Master'
      OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    )
    WITH CHECK (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR (get_user_role() = 'Master' AND (status = 'Pendente' OR status IS NULL))
      OR get_user_role() = 'Master'
      OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    );

END $$;
