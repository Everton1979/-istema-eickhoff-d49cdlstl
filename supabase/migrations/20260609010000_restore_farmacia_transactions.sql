-- Restore Farmácia Eickhoff transactions for April and May 2026

DO $$
DECLARE
  farmacia_id uuid;
  farmacia_app_name text;
  marcela_id uuid;
  marcela_app_name text;
BEGIN
  -- 1. Identify Users
  SELECT id, app_name INTO farmacia_id, farmacia_app_name
  FROM public.profiles
  WHERE email = 'farmaciaeickhoff@terra.com.br'
  LIMIT 1;

  SELECT id, app_name INTO marcela_id, marcela_app_name
  FROM public.profiles
  WHERE email = 'marcelaourique@yahoo.com.br'
  LIMIT 1;

  -- Proceed only if Farmacia exists
  IF farmacia_id IS NOT NULL THEN

    -- 2. Restore Transactions
    -- Move transactions back to Farmácia Eickhoff based on audit logs, 
    -- or falling back to the batch that was reassigned in the previous migration
    UPDATE public.transactions t
    SET user_id = farmacia_id,
        project_id = farmacia_app_name
    WHERE (
      EXISTS (
        SELECT 1 FROM public.audit_logs a 
        WHERE a.entity_id = t.id::text 
          AND a.user_id = farmacia_id
      )
      OR
      (
        marcela_id IS NOT NULL 
        AND t.user_id = marcela_id 
        AND t.date >= '2026-04-01 00:00:00-03'::timestamptz 
        AND t.date <= '2026-05-31 23:59:59.999-03'::timestamptz
        AND t.created_at < '2026-06-09 01:00:00-03'::timestamptz
      )
    );

    -- 3. Recalculate Metrics for Farmácia Eickhoff
    UPDATE public.monthly_metrics
    SET 
        orders_count = COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.project_id = farmacia_app_name AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-04-01 00:00:00-03'::timestamptz AND t.date < '2026-05-01 00:00:00-03'::timestamptz), 0),
        total_system_sales = COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.project_id = farmacia_app_name AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-04-01 00:00:00-03'::timestamptz AND t.date < '2026-05-01 00:00:00-03'::timestamptz), 0)
    WHERE project_id = farmacia_app_name AND month = 4 AND year = 2026;

    UPDATE public.monthly_metrics
    SET 
        orders_count = COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.project_id = farmacia_app_name AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-05-01 00:00:00-03'::timestamptz AND t.date < '2026-06-01 00:00:00-03'::timestamptz), 0),
        total_system_sales = COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.project_id = farmacia_app_name AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-05-01 00:00:00-03'::timestamptz AND t.date < '2026-06-01 00:00:00-03'::timestamptz), 0)
    WHERE project_id = farmacia_app_name AND month = 5 AND year = 2026;

  END IF;

  -- 4. Recalculate Metrics for Marcela Ourique
  IF marcela_id IS NOT NULL THEN
    UPDATE public.monthly_metrics
    SET 
        orders_count = COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.project_id = marcela_app_name AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-04-01 00:00:00-03'::timestamptz AND t.date < '2026-05-01 00:00:00-03'::timestamptz), 0),
        total_system_sales = COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.project_id = marcela_app_name AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-04-01 00:00:00-03'::timestamptz AND t.date < '2026-05-01 00:00:00-03'::timestamptz), 0)
    WHERE project_id = marcela_app_name AND month = 4 AND year = 2026;

    UPDATE public.monthly_metrics
    SET 
        orders_count = COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.project_id = marcela_app_name AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-05-01 00:00:00-03'::timestamptz AND t.date < '2026-06-01 00:00:00-03'::timestamptz), 0),
        total_system_sales = COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.project_id = marcela_app_name AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-05-01 00:00:00-03'::timestamptz AND t.date < '2026-06-01 00:00:00-03'::timestamptz), 0)
    WHERE project_id = marcela_app_name AND month = 5 AND year = 2026;
  END IF;

END $$;

-- 5. Helper function for Strict Status Checks
CREATE OR REPLACE FUNCTION public.get_user_status()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT status FROM profiles WHERE id = auth.uid();
$function$;

-- 6. Enhance RLS Policies for Absolute Data Isolation
-- This prevents 'Pendente' users from seeing data of the app_name they accidentally or maliciously joined.

DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT TO authenticated USING (
    project_id = get_user_app_name()
    AND (get_user_status() = 'Ativo' OR get_user_role() = 'Administrador')
  );

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (
    project_id = get_user_app_name() 
    AND user_id = auth.uid()
    AND (get_user_status() = 'Ativo' OR get_user_role() = 'Administrador')
  );

DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE TO authenticated USING (
    project_id = get_user_app_name() 
    AND (user_id = auth.uid() OR get_user_role() IN ('Administrador', 'Master'))
    AND (get_user_status() = 'Ativo' OR get_user_role() = 'Administrador')
  ) WITH CHECK (
    project_id = get_user_app_name()
  );

DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE TO authenticated USING (
    project_id = get_user_app_name() 
    AND (user_id = auth.uid() OR get_user_role() IN ('Administrador', 'Master'))
    AND (get_user_status() = 'Ativo' OR get_user_role() = 'Administrador')
  );
