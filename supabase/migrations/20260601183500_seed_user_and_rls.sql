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
      '{"name": "Administrador", "role": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
    ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "authenticated_select_transactions" ON public.transactions;
    CREATE POLICY "authenticated_select_transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_insert_transactions" ON public.transactions;
    CREATE POLICY "authenticated_insert_transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_update_transactions" ON public.transactions;
    CREATE POLICY "authenticated_update_transactions" ON public.transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_delete_transactions" ON public.transactions;
    CREATE POLICY "authenticated_delete_transactions" ON public.transactions FOR DELETE TO authenticated USING (true);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'monthly_metrics') THEN
    ALTER TABLE public.monthly_metrics ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "authenticated_select_metrics" ON public.monthly_metrics;
    CREATE POLICY "authenticated_select_metrics" ON public.monthly_metrics FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_insert_metrics" ON public.monthly_metrics;
    CREATE POLICY "authenticated_insert_metrics" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_update_metrics" ON public.monthly_metrics;
    CREATE POLICY "authenticated_update_metrics" ON public.monthly_metrics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_delete_metrics" ON public.monthly_metrics;
    CREATE POLICY "authenticated_delete_metrics" ON public.monthly_metrics FOR DELETE TO authenticated USING (true);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_settings') THEN
    ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "authenticated_select_settings" ON public.user_settings;
    CREATE POLICY "authenticated_select_settings" ON public.user_settings FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_insert_settings" ON public.user_settings;
    CREATE POLICY "authenticated_insert_settings" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_update_settings" ON public.user_settings;
    CREATE POLICY "authenticated_update_settings" ON public.user_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_delete_settings" ON public.user_settings;
    CREATE POLICY "authenticated_delete_settings" ON public.user_settings FOR DELETE TO authenticated USING (true);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "authenticated_select_audit" ON public.audit_logs;
    CREATE POLICY "authenticated_select_audit" ON public.audit_logs FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "authenticated_insert_audit" ON public.audit_logs;
    CREATE POLICY "authenticated_insert_audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_update_audit" ON public.audit_logs;
    CREATE POLICY "authenticated_update_audit" ON public.audit_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "authenticated_delete_audit" ON public.audit_logs;
    CREATE POLICY "authenticated_delete_audit" ON public.audit_logs FOR DELETE TO authenticated USING (true);
  END IF;
END $$;
