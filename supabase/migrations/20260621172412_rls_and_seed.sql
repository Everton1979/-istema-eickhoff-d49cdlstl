DO $$
BEGIN
  -- We must make the migration idempotent
  -- Drop policies first
  DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;

  DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
  DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
  DROP POLICY IF EXISTS "audit_logs_update" ON public.audit_logs;
  DROP POLICY IF EXISTS "audit_logs_delete" ON public.audit_logs;

  DROP POLICY IF EXISTS "monthly_metrics_select" ON public.monthly_metrics;
  DROP POLICY IF EXISTS "monthly_metrics_insert" ON public.monthly_metrics;
  DROP POLICY IF EXISTS "monthly_metrics_update" ON public.monthly_metrics;
  DROP POLICY IF EXISTS "monthly_metrics_delete" ON public.monthly_metrics;

  DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
  DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
  DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
  DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;

  DROP POLICY IF EXISTS "user_settings_select" ON public.user_settings;
  DROP POLICY IF EXISTS "user_settings_insert" ON public.user_settings;
  DROP POLICY IF EXISTS "user_settings_update" ON public.user_settings;
  DROP POLICY IF EXISTS "user_settings_delete" ON public.user_settings;

  DROP POLICY IF EXISTS "users_select" ON public.users;
  DROP POLICY IF EXISTS "users_insert" ON public.users;
  DROP POLICY IF EXISTS "users_update" ON public.users;
  DROP POLICY IF EXISTS "users_delete" ON public.users;

  -- Enable RLS
  ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.monthly_metrics ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

  -- Create new policies
  CREATE POLICY "appointments_select" ON public.appointments FOR SELECT TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "appointments_delete" ON public.appointments FOR DELETE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());

  CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "audit_logs_update" ON public.audit_logs FOR UPDATE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "audit_logs_delete" ON public.audit_logs FOR DELETE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());

  CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics FOR SELECT TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics FOR UPDATE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics FOR DELETE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());

  CREATE POLICY "transactions_select" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());

  CREATE POLICY "user_settings_select" ON public.user_settings FOR SELECT TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "user_settings_insert" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "user_settings_update" ON public.user_settings FOR UPDATE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "user_settings_delete" ON public.user_settings FOR DELETE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());

  CREATE POLICY "users_select" ON public.users FOR SELECT TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "users_insert" ON public.users FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "users_update" ON public.users FOR UPDATE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());
  CREATE POLICY "users_delete" ON public.users FOR DELETE TO authenticated USING (user_id = auth.uid() OR project_id = get_user_app_name() OR is_super_admin());

  -- Profiles
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
  
  CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR app_name = get_user_app_name() OR is_super_admin());
  CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
  CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR is_super_admin());
  CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid() OR is_super_admin());
END $$;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, role, is_super_admin, status)
    VALUES (new_user_id, 'farmaciaeickhoff@terra.com.br', 'admin', true, 'Ativo')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', is_super_admin = true, status = 'Ativo';
  ELSE
    UPDATE public.profiles 
    SET role = 'admin', is_super_admin = true, status = 'Ativo'
    WHERE email = 'farmaciaeickhoff@terra.com.br';
  END IF;
END $$;
