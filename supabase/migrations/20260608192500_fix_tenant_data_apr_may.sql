DO $$
DECLARE
  v_farmacia_id uuid;
  v_marcela_id uuid;
BEGIN
  -- 1. Identify User IDs safely
  SELECT id INTO v_farmacia_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  SELECT id INTO v_marcela_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br' LIMIT 1;

  -- 2. Ensure the profiles have the correct app_name (CNPJ-based identifier)
  IF v_farmacia_id IS NOT NULL THEN
    UPDATE public.profiles SET app_name = '30765609000112' WHERE id = v_farmacia_id;
  END IF;
  
  IF v_marcela_id IS NOT NULL THEN
    UPDATE public.profiles SET app_name = '02671419000109' WHERE id = v_marcela_id;
  END IF;

  -- 3. Migrate existing monthly_metrics for these users to the new project_id
  -- We do this carefully to avoid unique constraint violations on the year/month
  IF v_farmacia_id IS NOT NULL THEN
    UPDATE public.monthly_metrics mm1
    SET project_id = '30765609000112'
    WHERE mm1.user_id = v_farmacia_id
      AND mm1.year = 2026
      AND mm1.month IN (4, 5)
      AND mm1.project_id != '30765609000112'
      AND NOT EXISTS (
        SELECT 1 FROM public.monthly_metrics mm2 
        WHERE mm2.user_id = v_farmacia_id 
          AND mm2.project_id = '30765609000112' 
          AND mm2.year = 2026 
          AND mm2.month = mm1.month
      );
  END IF;

  IF v_marcela_id IS NOT NULL THEN
    UPDATE public.monthly_metrics mm1
    SET project_id = '02671419000109'
    WHERE mm1.user_id = v_marcela_id
      AND mm1.year = 2026
      AND mm1.month IN (4, 5)
      AND mm1.project_id != '02671419000109'
      AND NOT EXISTS (
        SELECT 1 FROM public.monthly_metrics mm2 
        WHERE mm2.user_id = v_marcela_id 
          AND mm2.project_id = '02671419000109' 
          AND mm2.year = 2026 
          AND mm2.month = mm1.month
      );
  END IF;

  -- 4. Update Transactions project_id for April and May 2026
  IF v_farmacia_id IS NOT NULL THEN
    UPDATE public.transactions
    SET project_id = '30765609000112'
    WHERE user_id = v_farmacia_id
      AND EXTRACT(YEAR FROM date) = 2026
      AND EXTRACT(MONTH FROM date) IN (4, 5);
  END IF;

  IF v_marcela_id IS NOT NULL THEN
    UPDATE public.transactions
    SET project_id = '02671419000109'
    WHERE user_id = v_marcela_id
      AND EXTRACT(YEAR FROM date) = 2026
      AND EXTRACT(MONTH FROM date) IN (4, 5);
  END IF;
END $$;

-- 5. Recalculate monthly_metrics for April and May 2026 using ON CONFLICT DO UPDATE
INSERT INTO public.monthly_metrics (
  user_id, project_id, year, month,
  orders_count, total_system_sales, raw_material_costs
)
SELECT 
  user_id,
  project_id,
  CAST(EXTRACT(YEAR FROM date) AS integer) as year,
  CAST(EXTRACT(MONTH FROM date) AS integer) as month,
  COUNT(id) as orders_count,
  COALESCE(SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE 0 END), 0) as total_system_sales,
  COALESCE(SUM(CASE WHEN type = 'DESPESA' THEN amount ELSE 0 END), 0) as raw_material_costs
FROM public.transactions
WHERE EXTRACT(YEAR FROM date) = 2026
  AND EXTRACT(MONTH FROM date) IN (4, 5)
  AND status = 'REALIZADO'
GROUP BY user_id, project_id, CAST(EXTRACT(YEAR FROM date) AS integer), CAST(EXTRACT(MONTH FROM date) AS integer)
ON CONFLICT (user_id, project_id, year, month)
DO UPDATE SET
  orders_count = EXCLUDED.orders_count,
  total_system_sales = EXCLUDED.total_system_sales,
  raw_material_costs = EXCLUDED.raw_material_costs,
  updated_at = NOW();

-- 6. Validate and enforce RLS policies for tenant isolation ensuring project_id respect boundaries
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
CREATE POLICY "Users can manage transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (project_id = get_user_app_name())
  WITH CHECK (project_id = get_user_app_name());

DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Users can manage monthly metrics" ON public.monthly_metrics
  FOR ALL TO authenticated
  USING (project_id = get_user_app_name())
  WITH CHECK (project_id = get_user_app_name());
