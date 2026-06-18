DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all existing policies for the financial and profile tables to ensure clean slate
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'transactions' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.transactions', pol.policyname);
    END LOOP;

    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'monthly_metrics' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.monthly_metrics', pol.policyname);
    END LOOP;

    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'appointments' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.appointments', pol.policyname);
    END LOOP;

    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'user_settings' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_settings', pol.policyname);
    END LOOP;

    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Update the main master user to enforce Master role and super admin flag
UPDATE public.profiles 
SET role = 'Master', is_super_admin = true 
WHERE email = 'farmaciaeickhoff@terra.com.br';

-- 1. Profiles Table Policies (Allows Master global access)
CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() 
    OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    OR is_super_admin()
    OR get_user_role() = 'Master'
  );

CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() 
    OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    OR is_super_admin()
    OR get_user_role() = 'Master'
  )
  WITH CHECK (
    id = auth.uid() 
    OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    OR is_super_admin()
    OR get_user_role() = 'Master'
  );

CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    id = auth.uid() 
    OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    OR is_super_admin()
    OR get_user_role() = 'Master'
  );

-- 2. Strict Owner Isolation for Financial Tables (Even Master cannot see other users' financial data)
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "appointments_select" ON public.appointments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "appointments_delete" ON public.appointments FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_settings_select" ON public.user_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_settings_insert" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_settings_update" ON public.user_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_settings_delete" ON public.user_settings FOR DELETE TO authenticated USING (user_id = auth.uid());
