-- Fix RLS for the users table
DROP POLICY IF EXISTS "Users can read their own project users" ON public.users;
CREATE POLICY "Users can read their own project users" ON public.users
  FOR SELECT TO authenticated USING (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can insert into their own project" ON public.users;
CREATE POLICY "Users can insert into their own project" ON public.users
  FOR INSERT TO authenticated WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can update their own project users" ON public.users;
CREATE POLICY "Users can update their own project users" ON public.users
  FOR UPDATE TO authenticated USING (project_id = public.get_user_app_name()) WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can delete their own project users" ON public.users;
CREATE POLICY "Users can delete their own project users" ON public.users
  FOR DELETE TO authenticated USING (project_id = public.get_user_app_name());

DO $$
DECLARE
  v_source_user_id uuid;
  v_source_project_id text;
  v_dest_user_id uuid;
  v_dest_project_id text;
  v_month int;
BEGIN
  -- Profile CNPJ 30765609000112 (Farmacia)
  SELECT id, app_name INTO v_source_user_id, v_source_project_id
  FROM public.profiles
  WHERE cnpj = '30765609000112' OR email = 'farmaciaeickhoff@terra.com.br'
  ORDER BY created_at ASC
  LIMIT 1;

  -- Profile CNPJ 02671419000109 (Marcela)
  SELECT id, app_name INTO v_dest_user_id, v_dest_project_id
  FROM public.profiles
  WHERE cnpj = '02671419000109' OR email = 'marcelaourique@yahoo.com.br'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_source_user_id IS NOT NULL AND v_dest_user_id IS NOT NULL THEN
    
    -- Specific Correction 1: Prolabore
    UPDATE public.transactions
    SET user_id = v_dest_user_id, project_id = v_dest_project_id
    WHERE project_id = v_source_project_id
      AND description = 'Prolabore'
      AND amount = 16552.29
      AND date >= '2026-05-31 00:00:00+00' AND date < '2026-06-01 00:00:00+00';

    -- Specific Correction 2: Compras Marcela
    UPDATE public.transactions
    SET user_id = v_dest_user_id, project_id = v_dest_project_id
    WHERE project_id = v_source_project_id
      AND description = 'Compras Marcela'
      AND amount = 1084.15
      AND date >= '2026-05-31 00:00:00+00' AND date < '2026-06-01 00:00:00+00';

    -- Audit Range: Q2 2026 Cleanup
    -- Any records belonging to the business owner of CNPJ 02671419000109 that are currently linked to the project_id or user_id of CNPJ 30765609000112
    UPDATE public.transactions
    SET user_id = v_dest_user_id, project_id = v_dest_project_id
    WHERE (
        (user_id = v_dest_user_id AND project_id = v_source_project_id)
        OR
        (project_id = v_dest_project_id AND user_id = v_source_user_id)
      )
      AND date >= '2026-04-01 00:00:00+00' AND date < '2026-07-01 00:00:00+00';

    -- Metric Integrity
    FOR v_month IN 4..6 LOOP
      -- Update Source
      UPDATE public.monthly_metrics mm
      SET 
        total_system_sales = COALESCE((
          SELECT sum(amount) FROM public.transactions t
          WHERE t.project_id = v_source_project_id 
            AND t.type ILIKE 'RECEITA%'
            AND EXTRACT(MONTH FROM t.date AT TIME ZONE 'UTC') = v_month 
            AND EXTRACT(YEAR FROM t.date AT TIME ZONE 'UTC') = 2026
        ), 0),
        raw_material_costs = COALESCE((
          SELECT sum(amount) FROM public.transactions t
          WHERE t.project_id = v_source_project_id 
            AND t.type ILIKE 'DESPESA%'
            AND EXTRACT(MONTH FROM t.date AT TIME ZONE 'UTC') = v_month 
            AND EXTRACT(YEAR FROM t.date AT TIME ZONE 'UTC') = 2026
        ), 0)
      WHERE mm.project_id = v_source_project_id AND mm.month = v_month AND mm.year = 2026;

      -- Update Dest
      UPDATE public.monthly_metrics mm
      SET 
        total_system_sales = COALESCE((
          SELECT sum(amount) FROM public.transactions t
          WHERE t.project_id = v_dest_project_id 
            AND t.type ILIKE 'RECEITA%'
            AND EXTRACT(MONTH FROM t.date AT TIME ZONE 'UTC') = v_month 
            AND EXTRACT(YEAR FROM t.date AT TIME ZONE 'UTC') = 2026
        ), 0),
        raw_material_costs = COALESCE((
          SELECT sum(amount) FROM public.transactions t
          WHERE t.project_id = v_dest_project_id 
            AND t.type ILIKE 'DESPESA%'
            AND EXTRACT(MONTH FROM t.date AT TIME ZONE 'UTC') = v_month 
            AND EXTRACT(YEAR FROM t.date AT TIME ZONE 'UTC') = 2026
        ), 0)
      WHERE mm.project_id = v_dest_project_id AND mm.month = v_month AND mm.year = 2026;
    END LOOP;

  END IF;
END $$;
