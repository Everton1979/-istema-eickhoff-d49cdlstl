DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verificando o usuário na tabela auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  
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
      '{"name": "Master Administrador"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users 
    SET 
      is_super_admin = true,
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"name": "Master Administrador"}'::jsonb
    WHERE id = v_user_id;
  END IF;

  -- Certificar que profiles existe ou atualiza
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    INSERT INTO public.profiles (id, email, role, status, is_super_admin)
    VALUES (v_user_id, 'farmaciaeickhoff@terra.com.br', 'admin', 'Ativo', true);
  ELSE
    UPDATE public.profiles
    SET 
      is_super_admin = true,
      status = 'Ativo',
      role = 'admin'
    WHERE id = v_user_id;
  END IF;

END $$;
