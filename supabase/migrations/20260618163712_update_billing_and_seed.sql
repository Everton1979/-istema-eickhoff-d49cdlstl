DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador Farmácia Eickhoff"}',
      true, 'authenticated', 'authenticated',
      '',    -- confirmation_token
      '',    -- recovery_token
      '',    -- email_change_token_new
      '',    -- email_change
      '',    -- email_change_token_current
      NULL,  -- phone
      '',    -- phone_change
      '',    -- phone_change_token
      ''     -- reauthentication_token
    );

    INSERT INTO public.profiles (id, email, role, status, plan_type, is_super_admin)
    VALUES (new_user_id, 'farmaciaeickhoff@terra.com.br', 'Administrador', 'Ativo', 'anual', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can read own profile status" ON public.profiles;
CREATE POLICY "Users can read own profile status" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can update profiles status" ON public.profiles;
CREATE POLICY "Service role can update profiles status" ON public.profiles
  FOR UPDATE TO service_role USING (true);
