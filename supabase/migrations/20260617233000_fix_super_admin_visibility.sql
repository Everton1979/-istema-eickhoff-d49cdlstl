DO $block$
DECLARE
  v_master_id uuid;
  v_everton_id uuid;
BEGIN
  -- 1. Ensure farmaciaeickhoff@terra.com.br exists as Master
  SELECT id INTO v_master_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;

  IF v_master_id IS NULL THEN
    v_master_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_master_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (
    id, email, role, status, app_name, is_super_admin
  ) VALUES (
    v_master_id, 'farmaciaeickhoff@terra.com.br', 'Master', 'Ativo', v_master_id::text, true
  ) ON CONFLICT (id) DO UPDATE SET 
    role = 'Master',
    is_super_admin = true,
    status = 'Ativo';

  UPDATE public.profiles
  SET role = 'Master', is_super_admin = true, status = 'Ativo'
  WHERE email = 'farmaciaeickhoff@terra.com.br';


  -- 2. Seed evertoneickhoff@terra.com.br to verify functionality
  SELECT id INTO v_everton_id FROM auth.users WHERE email = 'evertoneickhoff@terra.com.br' LIMIT 1;
  IF v_everton_id IS NULL THEN
    v_everton_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_everton_id,
      '00000000-0000-0000-0000-000000000000',
      'evertoneickhoff@terra.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Everton"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (
    id, email, role, status, app_name, is_super_admin
  ) VALUES (
    v_everton_id, 'evertoneickhoff@terra.com.br', 'Administrador', 'Pendente', v_everton_id::text, false
  ) ON CONFLICT (id) DO NOTHING;

END $block$;

-- 3. PROFILES RLS: Allow Master to see all profiles
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
  );

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
  )
  WITH CHECK (
    id = auth.uid()
    OR (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
  );

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid()
    OR (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
  );

DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;
CREATE POLICY "Users can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
  );

-- 4. TRANSACTIONS RLS: Ensure financial data is isolated even from Master, Master only sees their own company
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT TO authenticated 
  USING (
    (project_id = get_user_app_name()) AND 
    ((get_user_status() = 'Ativo') OR (get_user_role() = ANY (ARRAY['Administrador', 'Master'])))
  );

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT TO authenticated 
  WITH CHECK (
    (project_id = get_user_app_name()) AND 
    (user_id = auth.uid()) AND 
    ((get_user_status() = 'Ativo') OR (get_user_role() = ANY (ARRAY['Administrador', 'Master'])))
  );

DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE TO authenticated 
  USING (
    (project_id = get_user_app_name()) AND 
    ((user_id = auth.uid()) OR (get_user_role() = ANY (ARRAY['Administrador', 'Master']))) AND 
    ((get_user_status() = 'Ativo') OR (get_user_role() = ANY (ARRAY['Administrador', 'Master'])))
  )
  WITH CHECK (
    (project_id = get_user_app_name())
  );

DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE TO authenticated 
  USING (
    (project_id = get_user_app_name()) AND 
    ((user_id = auth.uid()) OR (get_user_role() = ANY (ARRAY['Administrador', 'Master']))) AND 
    ((get_user_status() = 'Ativo') OR (get_user_role() = ANY (ARRAY['Administrador', 'Master'])))
  );

-- 5. MONTHLY METRICS RLS: Ensure operational data is isolated
DROP POLICY IF EXISTS "monthly_metrics_select" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics
  FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "monthly_metrics_insert" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics
  FOR INSERT TO authenticated
  WITH CHECK (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "monthly_metrics_update" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics
  FOR UPDATE TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())))
  WITH CHECK (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "monthly_metrics_delete" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics
  FOR DELETE TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

-- 6. APPOINTMENTS RLS: Ensure operational data is isolated
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
CREATE POLICY "appointments_insert" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
CREATE POLICY "appointments_update" ON public.appointments
  FOR UPDATE TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())))
  WITH CHECK (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;
CREATE POLICY "appointments_delete" ON public.appointments
  FOR DELETE TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

-- 7. USER SETTINGS RLS: Ensure config data is isolated
DROP POLICY IF EXISTS "user_settings_select" ON public.user_settings;
CREATE POLICY "user_settings_select" ON public.user_settings
  FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "user_settings_insert" ON public.user_settings;
CREATE POLICY "user_settings_insert" ON public.user_settings
  FOR INSERT TO authenticated
  WITH CHECK (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "user_settings_update" ON public.user_settings;
CREATE POLICY "user_settings_update" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())))
  WITH CHECK (((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "user_settings_delete" ON public.user_settings;
CREATE POLICY "user_settings_delete" ON public.user_settings
  FOR DELETE TO authenticated
  USING (((user_id = auth.uid()) AND (project_id = get_user_app_name())));
