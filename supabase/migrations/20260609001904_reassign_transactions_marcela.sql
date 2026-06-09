-- Migration to move transactions from Farmacia Eickhoff to Marcela Ourique for April and May 2026

DO $$
DECLARE
  source_user_id uuid;
  source_project_id text;
  target_user_id uuid;
  target_project_id text;
BEGIN
  -- 1. Identify Source User
  SELECT id, app_name INTO source_user_id, source_project_id
  FROM public.profiles
  WHERE email = 'farmaciaeickhoff@terra.com.br'
  LIMIT 1;

  -- 2. Identify Target User
  SELECT id, app_name INTO target_user_id, target_project_id
  FROM public.profiles
  WHERE email = 'marcelaourique@yahoo.com.br'
  LIMIT 1;

  -- If we can't find both users, exit gracefully (idempotent / safe)
  IF source_user_id IS NULL OR target_user_id IS NULL THEN
    RAISE NOTICE 'Source or Target user not found. Skipping transaction reassignment.';
    RETURN;
  END IF;

  -- 3. Reassign Transactions
  -- Update all records linked to Farmacia Eickhoff between 2026-04-01 and 2026-05-31
  UPDATE public.transactions
  SET user_id = target_user_id,
      project_id = target_project_id
  WHERE user_id = source_user_id
    AND date >= '2026-04-01 00:00:00-03'::timestamptz
    AND date <= '2026-05-31 23:59:59.999-03'::timestamptz;

  -- 4. Metric Recalculation for Source User (April)
  UPDATE public.monthly_metrics
  SET 
      orders_count = COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.project_id = source_project_id AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-04-01 00:00:00-03'::timestamptz AND t.date < '2026-05-01 00:00:00-03'::timestamptz), 0),
      total_system_sales = COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.project_id = source_project_id AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-04-01 00:00:00-03'::timestamptz AND t.date < '2026-05-01 00:00:00-03'::timestamptz), 0)
  WHERE project_id = source_project_id AND month = 4 AND year = 2026;

  -- 5. Metric Recalculation for Source User (May)
  UPDATE public.monthly_metrics
  SET 
      orders_count = COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.project_id = source_project_id AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-05-01 00:00:00-03'::timestamptz AND t.date < '2026-06-01 00:00:00-03'::timestamptz), 0),
      total_system_sales = COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.project_id = source_project_id AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-05-01 00:00:00-03'::timestamptz AND t.date < '2026-06-01 00:00:00-03'::timestamptz), 0)
  WHERE project_id = source_project_id AND month = 5 AND year = 2026;

  -- 6. Metric Recalculation for Target User (April)
  UPDATE public.monthly_metrics
  SET 
      orders_count = COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.project_id = target_project_id AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-04-01 00:00:00-03'::timestamptz AND t.date < '2026-05-01 00:00:00-03'::timestamptz), 0),
      total_system_sales = COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.project_id = target_project_id AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-04-01 00:00:00-03'::timestamptz AND t.date < '2026-05-01 00:00:00-03'::timestamptz), 0)
  WHERE project_id = target_project_id AND month = 4 AND year = 2026;

  -- 7. Metric Recalculation for Target User (May)
  UPDATE public.monthly_metrics
  SET 
      orders_count = COALESCE((SELECT COUNT(*) FROM public.transactions t WHERE t.project_id = target_project_id AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-05-01 00:00:00-03'::timestamptz AND t.date < '2026-06-01 00:00:00-03'::timestamptz), 0),
      total_system_sales = COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.project_id = target_project_id AND (t.type ILIKE 'receita%' OR t.type ILIKE 'entrada%') AND t.date >= '2026-05-01 00:00:00-03'::timestamptz AND t.date < '2026-06-01 00:00:00-03'::timestamptz), 0)
  WHERE project_id = target_project_id AND month = 5 AND year = 2026;

END $$;

-- 8. RLS Verification: strictly use project_id = get_user_app_name()
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT TO authenticated USING (project_id = get_user_app_name());

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (project_id = get_user_app_name());

DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE TO authenticated USING (project_id = get_user_app_name())
  WITH CHECK (project_id = get_user_app_name());

DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE TO authenticated USING (project_id = get_user_app_name());
