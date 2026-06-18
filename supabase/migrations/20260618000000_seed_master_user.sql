DO $$
DECLARE
  master_user_id uuid;
BEGIN
  SELECT id INTO master_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
  
  IF master_user_id IS NULL THEN
    master_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      master_user_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Farmácia"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (id, email, razao_social, nome_fantasia, role, status, is_super_admin)
  VALUES (master_user_id, 'farmaciaeickhoff@terra.com.br', 'Farmácia Eickhoff', 'Farmácia Eickhoff', 'Master', 'Ativo', true)
  ON CONFLICT (id) DO UPDATE SET is_super_admin = true, role = 'Master', status = 'Ativo';
END $$;
