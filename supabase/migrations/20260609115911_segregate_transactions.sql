DO $$
DECLARE
  v_marcela_id uuid;
  v_marcela_project_id text;
  v_farmacia_id uuid;
  v_farmacia_project_id text;
BEGIN
  -- 1. Identify Farmácia Eickhoff
  SELECT id INTO v_farmacia_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
  
  IF v_farmacia_id IS NOT NULL THEN
    SELECT COALESCE(NULLIF(app_name, ''), id::text) 
    INTO v_farmacia_project_id
    FROM public.profiles
    WHERE id = v_farmacia_id;
  END IF;

  -- 2. Identify or Create Marcela Ourique
  SELECT id INTO v_marcela_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br';
  
  IF v_marcela_id IS NULL THEN
    v_marcela_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_marcela_id,
      '00000000-0000-0000-0000-000000000000',
      'marcelaourique@yahoo.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"razao_social": "Marcela Ourique"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure Marcela's profile exists to maintain foreign key and relationship integrity
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_marcela_id) THEN
    INSERT INTO public.profiles (
      id, 
      email, 
      app_name, 
      role, 
      status, 
      razao_social
    )
    VALUES (
      v_marcela_id, 
      'marcelaourique@yahoo.com.br', 
      v_marcela_id::text, 
      'Administrador', 
      'Ativo', 
      'Marcela Ourique'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Fetch Marcela's project_id (app_name resolution based on get_user_app_name logic)
  SELECT COALESCE(NULLIF(app_name, ''), id::text) 
  INTO v_marcela_project_id
  FROM public.profiles
  WHERE id = v_marcela_id;

  -- 3. Migration Logic for Transaction Ownership Redistribution
  -- Update records belonging to April 1st, 2026 without tags to Marcela Ourique
  UPDATE public.transactions
  SET user_id = v_marcela_id,
      project_id = v_marcela_project_id
  WHERE date >= '2026-04-01 00:00:00+00' 
    AND date <= '2026-04-01 23:59:59+00'
    AND (tags IS NULL OR tags = '');

  -- NOTE: Records from April 1st, 2026, where tags contain 'farmaciaeickhoff@terra.com.br' 
  -- will naturally not be caught by the above UPDATE statement, therefore 
  -- remaining correctly assigned to Farmácia Eickhoff's project_id and user_id.
END $$;
