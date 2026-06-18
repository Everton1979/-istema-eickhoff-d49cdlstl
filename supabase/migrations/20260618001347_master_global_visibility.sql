DO $BODY$
DECLARE
  master_id uuid;
BEGIN
  -- 1. Seed Master User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br') THEN
    master_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      master_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (
      id, email, role, status, plan_type, app_name
    ) VALUES (
      master_id, 'farmaciaeickhoff@terra.com.br', 'Master', 'Ativo', 'anual', 'Master'
    ) ON CONFLICT (id) DO UPDATE SET 
      role = 'Master',
      status = 'Ativo',
      app_name = 'Master';
  ELSE
    SELECT id INTO master_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
    
    UPDATE public.profiles 
    SET role = 'Master', status = 'Ativo'
    WHERE id = master_id;
  END IF;

  -- 2. Update RLS on profiles to allow Master to see all profiles (including Pendente/NULL) globally
  DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
  CREATE POLICY "Users can read profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'farmaciaeickhoff@terra.com.br'
    );

  -- 3. Update RLS to allow Master to approve/update any profile globally
  DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
  CREATE POLICY "Users can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'farmaciaeickhoff@terra.com.br'
    )
    WITH CHECK (
      id = auth.uid() 
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'farmaciaeickhoff@terra.com.br'
    );
END $BODY$;
