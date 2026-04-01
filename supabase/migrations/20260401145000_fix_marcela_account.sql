DO $
DECLARE
  v_user_id uuid;
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br';
  
  IF v_user_id IS NOT NULL THEN
    -- Atualizar senha para 'Marcela123!' e garantir que o e-mail está confirmado
    UPDATE auth.users
    SET encrypted_password = crypt('Marcela123!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = v_user_id;
  ELSE
    -- Criar novo usuário com senha 'Marcela123!'
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
      'marcelaourique@yahoo.com.br',
      crypt('Marcela123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Marcela"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    -- Criar o perfil de Administrador vinculado ao usuário criado
    INSERT INTO public.profiles (id, email, role)
    VALUES (v_user_id, 'marcelaourique@yahoo.com.br', 'Administrador')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $;
