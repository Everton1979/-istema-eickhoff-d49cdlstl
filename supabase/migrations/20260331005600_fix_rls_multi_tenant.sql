-- Fix RLS policies to restrict data access by user_id for multi-tenancy

-- 1. TRANSACTIONS
DROP POLICY IF EXISTS "Authenticated users can read transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admin and Colaborador can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admin and Colaborador can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admin can delete transactions" ON public.transactions;

CREATE POLICY "Users can read own transactions" ON public.transactions 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON public.transactions 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON public.transactions 
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON public.transactions 
  FOR DELETE TO authenticated USING (user_id = auth.uid());


-- 2. MONTHLY METRICS
DROP POLICY IF EXISTS "Authenticated users can read monthly metrics" ON public.monthly_metrics;
DROP POLICY IF EXISTS "Admin and Colaborador can insert monthly metrics" ON public.monthly_metrics;
DROP POLICY IF EXISTS "Admin and Colaborador can update monthly metrics" ON public.monthly_metrics;
DROP POLICY IF EXISTS "Admin can delete monthly metrics" ON public.monthly_metrics;

CREATE POLICY "Users can read own monthly metrics" ON public.monthly_metrics 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own monthly metrics" ON public.monthly_metrics 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own monthly metrics" ON public.monthly_metrics 
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own monthly metrics" ON public.monthly_metrics 
  FOR DELETE TO authenticated USING (user_id = auth.uid());


-- 3. USER SETTINGS
DROP POLICY IF EXISTS "Authenticated users can read user settings" ON public.user_settings;
DROP POLICY IF EXISTS "Admin can insert user settings" ON public.user_settings;
DROP POLICY IF EXISTS "Admin can update user settings" ON public.user_settings;
DROP POLICY IF EXISTS "Admin can delete user settings" ON public.user_settings;

CREATE POLICY "Users can read own user settings" ON public.user_settings 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own user settings" ON public.user_settings 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own user settings" ON public.user_settings 
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own user settings" ON public.user_settings 
  FOR DELETE TO authenticated USING (user_id = auth.uid());
