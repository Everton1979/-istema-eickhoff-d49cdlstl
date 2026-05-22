DO $$
DECLARE
  new_admin_id uuid;
BEGIN
  -- 1. Ensure farmaciaeickhoff@terra.com.br exists idempotently
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br') THEN
    new_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"app_name": "farmacia"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- 2. Data Correction for profiles
  -- Update all users to 'farmacia' except 'lisianezdruikoski@gmail.com'
  UPDATE public.profiles
  SET app_name = 'farmacia'
  WHERE email != 'lisianezdruikoski@gmail.com' AND (app_name IS NULL OR app_name != 'farmacia');

  -- Ensure 'lisianezdruikoski@gmail.com' is specifically assigned to 'salaofacil'
  UPDATE public.profiles
  SET app_name = 'salaofacil'
  WHERE email = 'lisianezdruikoski@gmail.com' AND (app_name IS NULL OR app_name != 'salaofacil');

  -- 3. Force Admin properties for safety
  UPDATE public.profiles
  SET app_name = 'farmacia', role = 'Administrador', status = 'Ativo'
  WHERE email = 'farmaciaeickhoff@terra.com.br';

END $$;
