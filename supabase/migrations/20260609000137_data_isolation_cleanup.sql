DO $$
DECLARE
  v_farmacia_id uuid;
BEGIN
  -- Find the specific user to cleanup
  SELECT id INTO v_farmacia_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  
  IF v_farmacia_id IS NOT NULL THEN
    -- Delete the specific incorrect transactions as requested in the AC
    DELETE FROM public.transactions 
    WHERE user_id = v_farmacia_id 
    AND (
      (amount = 16552.29 AND description ILIKE '%prolabore%') OR 
      (amount = 1084.15 AND description ILIKE '%marcela%')
    );
  END IF;
END $$;

-- Drop existing policies to reinforce data isolation
DO $$
DECLARE
  t text;
  p text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('transactions', 'appointments', 'monthly_metrics', 'user_settings', 'audit_logs') LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
    END LOOP;
  END LOOP;
END $$;

-- Recreate policies for transactions
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name()) WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());

-- Recreate policies for appointments
CREATE POLICY "appointments_select" ON public.appointments FOR SELECT TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name()) WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "appointments_delete" ON public.appointments FOR DELETE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());

-- Recreate policies for monthly_metrics
CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics FOR SELECT TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics FOR UPDATE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name()) WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics FOR DELETE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());

-- Recreate policies for user_settings
CREATE POLICY "user_settings_select" ON public.user_settings FOR SELECT TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "user_settings_insert" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "user_settings_update" ON public.user_settings FOR UPDATE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name()) WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "user_settings_delete" ON public.user_settings FOR DELETE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());

-- Recreate policies for audit_logs
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "audit_logs_update" ON public.audit_logs FOR UPDATE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name()) WITH CHECK (user_id = auth.uid() AND project_id = public.get_user_app_name());
CREATE POLICY "audit_logs_delete" ON public.audit_logs FOR DELETE TO authenticated USING (user_id = auth.uid() AND project_id = public.get_user_app_name());

-- Update the set_project_id trigger function to enforce strict user matching
CREATE OR REPLACE FUNCTION public.set_project_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Prevent insertion if user_id doesn't match auth.uid(), strictly enforcing isolation
  IF auth.uid() IS NOT NULL AND NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  -- Force project_id to match the user's app_name based on their user_id
  SELECT COALESCE(NULLIF(app_name, ''), id::text)
  INTO NEW.project_id
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF NEW.project_id IS NULL THEN
    NEW.project_id := NEW.user_id::text;
  END IF;

  RETURN NEW;
END;
$function$;
