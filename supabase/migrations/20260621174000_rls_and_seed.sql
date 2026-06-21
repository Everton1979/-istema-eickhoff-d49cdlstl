-- Enable RLS on all tables
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure idempotency
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('appointments', 'audit_logs', 'monthly_metrics', 'profiles', 'transactions', 'user_settings')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Create strict isolation policies for appointments
CREATE POLICY "user_appointments_select" ON public.appointments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_appointments_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_appointments_update" ON public.appointments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_appointments_delete" ON public.appointments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Create strict isolation policies for audit_logs
CREATE POLICY "user_audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_audit_logs_update" ON public.audit_logs FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_audit_logs_delete" ON public.audit_logs FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Create strict isolation policies for monthly_metrics
CREATE POLICY "user_monthly_metrics_select" ON public.monthly_metrics FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_monthly_metrics_insert" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_monthly_metrics_update" ON public.monthly_metrics FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_monthly_metrics_delete" ON public.monthly_metrics FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Create strict isolation policies for transactions
CREATE POLICY "user_transactions_select" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_transactions_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_transactions_update" ON public.transactions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_transactions_delete" ON public.transactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Create strict isolation policies for user_settings
CREATE POLICY "user_settings_select" ON public.user_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_settings_insert" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_settings_update" ON public.user_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_settings_delete" ON public.user_settings FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Create policies for profiles (Master has full management capability over profiles)
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br');
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br') WITH CHECK (id = auth.uid() OR auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br');
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid() OR auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br');
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br');

-- Ensure default role is Admin for new users
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'Admin';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status, plan_type)
  VALUES (NEW.id, NEW.email, 'Admin', 'Pendente', 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Master seed for required email farmaciaeickhoff@terra.com.br
DO $$
DECLARE
  master_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br') THEN
    master_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      master_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master Admin"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, role, is_super_admin, status, plan_type)
    VALUES (master_id, 'farmaciaeickhoff@terra.com.br', 'Master', true, 'Ativo', 'anual')
    ON CONFLICT (id) DO UPDATE SET is_super_admin = true, role = 'Master', status = 'Ativo';
  ELSE
    SELECT id INTO master_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
    
    UPDATE auth.users SET is_super_admin = true WHERE id = master_id;
    
    INSERT INTO public.profiles (id, email, role, is_super_admin, status, plan_type)
    VALUES (master_id, 'farmaciaeickhoff@terra.com.br', 'Master', true, 'Ativo', 'anual')
    ON CONFLICT (id) DO UPDATE SET is_super_admin = true, role = 'Master', status = 'Ativo';
  END IF;
END $$;
