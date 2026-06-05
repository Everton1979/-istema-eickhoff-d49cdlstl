-- 1. Standardize app_name in profiles to restore visibility
UPDATE public.profiles
SET app_name = 'farmacia_eickhoff'
WHERE app_name IS NULL OR app_name = '';

-- 2. Enforce strict Row Level Security (RLS) for data isolation
-- Transactions
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
CREATE POLICY "Users can manage transactions" ON public.transactions
  FOR ALL TO authenticated 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Monthly Metrics
DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Users can manage monthly metrics" ON public.monthly_metrics
  FOR ALL TO authenticated 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Appointments
DROP POLICY IF EXISTS "Users can manage appointments" ON public.appointments;
CREATE POLICY "Users can manage appointments" ON public.appointments
  FOR ALL TO authenticated 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Audit Logs (Project-level isolation)
DROP POLICY IF EXISTS "Users can manage audit logs" ON public.audit_logs;
CREATE POLICY "Users can manage audit logs" ON public.audit_logs
  FOR ALL TO authenticated 
  USING (project_id = public.get_user_app_name()) 
  WITH CHECK (project_id = public.get_user_app_name());

-- 3. Targeted Data Cleanup for 2026 Records
-- Clean up duplicated/cross-contaminated transactions between specific accounts in April & May 2026
DO $$
DECLARE
    marcela_id uuid;
    farmacia_id uuid;
BEGIN
    SELECT id INTO marcela_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br' LIMIT 1;
    SELECT id INTO farmacia_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;

    IF marcela_id IS NOT NULL AND farmacia_id IS NOT NULL THEN
        -- Remove Marcela's transactions if they are exact duplicates of Farmacia's
        DELETE FROM public.transactions t1
        WHERE t1.user_id = marcela_id
          AND t1.date >= '2026-04-01' AND t1.date < '2026-06-01'
          AND EXISTS (
              SELECT 1 FROM public.transactions t2
              WHERE t2.user_id = farmacia_id
                AND t2.date = t1.date
                AND t2.amount = t1.amount
                AND t2.description = t1.description
                AND t2.type = t1.type
          );
          
        -- Remove Farmacia's transactions if they are exact duplicates of Marcela's
        DELETE FROM public.transactions t1
        WHERE t1.user_id = farmacia_id
          AND t1.date >= '2026-04-01' AND t1.date < '2026-06-01'
          AND EXISTS (
              SELECT 1 FROM public.transactions t2
              WHERE t2.user_id = marcela_id
                AND t2.date = t1.date
                AND t2.amount = t1.amount
                AND t2.description = t1.description
                AND t2.type = t1.type
          );
    END IF;
END $$;
