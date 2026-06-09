DO $$
DECLARE
  v_eickhoff_user_id uuid;
  v_eickhoff_project_id text;
  v_project_id text;
  v_month int;
BEGIN
  -- 1. Create seed user if not exists (Idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br') THEN
    v_eickhoff_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_eickhoff_user_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Farmácia Eickhoff"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, razao_social, is_super_admin, role, status, app_name)
    VALUES (v_eickhoff_user_id, 'farmaciaeickhoff@terra.com.br', 'Farmácia Eickhoff', true, 'Administrador', 'Ativo', 'Eickhoff')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Fetch the user_id for the target account
  SELECT id INTO v_eickhoff_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;

  -- Ensure we have the correct project_id (app_name) mapping
  SELECT COALESCE(NULLIF(app_name, ''), id::text) 
  INTO v_eickhoff_project_id 
  FROM public.profiles 
  WHERE id = v_eickhoff_user_id;

  IF v_eickhoff_project_id IS NULL THEN
    v_eickhoff_project_id := v_eickhoff_user_id::text;
    UPDATE public.profiles SET app_name = v_eickhoff_project_id WHERE id = v_eickhoff_user_id;
  END IF;

  -- 2. Extract original creators for transactions from audit logs
  CREATE TEMP TABLE temp_tx_orig ON COMMIT DROP AS
  SELECT entity_id::uuid as tx_id, user_id
  FROM (
    SELECT entity_id, user_id, ROW_NUMBER() OVER(PARTITION BY entity_id ORDER BY created_at ASC) as rn
    FROM public.audit_logs
    WHERE entity = 'transactions' 
      AND entity_id IS NOT NULL 
      -- Ensure valid UUIDs only to prevent cast errors
      AND entity_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ) a
  WHERE rn = 1;

  -- 3. Cleanup: Move incorrectly assigned transactions out of Eickhoff project
  UPDATE public.transactions t
  SET 
    user_id = orig.user_id,
    project_id = COALESCE(NULLIF(p.app_name, ''), p.id::text, orig.user_id::text)
  FROM temp_tx_orig orig
  LEFT JOIN public.profiles p ON p.id = orig.user_id
  WHERE t.id = orig.tx_id
    AND t.project_id = v_eickhoff_project_id
    AND orig.user_id != v_eickhoff_user_id
    -- Only affect April and May of 2024 to safeguard current (June onwards) data
    AND EXTRACT(MONTH FROM t.date) IN (4, 5)
    AND EXTRACT(YEAR FROM t.date) = 2024;

  -- 4. Restore: Move Eickhoff's own transactions back to Eickhoff project
  UPDATE public.transactions t
  SET 
    user_id = v_eickhoff_user_id,
    project_id = v_eickhoff_project_id
  FROM temp_tx_orig orig
  WHERE t.id = orig.tx_id
    AND orig.user_id = v_eickhoff_user_id
    AND (t.project_id != v_eickhoff_project_id OR t.user_id != v_eickhoff_user_id)
    AND EXTRACT(MONTH FROM t.date) IN (4, 5)
    AND EXTRACT(YEAR FROM t.date) = 2024;

  -- 5. Monthly Metrics Recalculation (April and May 2024 ONLY) for affected projects
  FOR v_project_id IN (
    SELECT DISTINCT project_id 
    FROM public.transactions 
    WHERE EXTRACT(MONTH FROM date) IN (4, 5) 
      AND EXTRACT(YEAR FROM date) = 2024
  ) LOOP
    FOR v_month IN 4..5 LOOP
      
      UPDATE public.monthly_metrics mm
      SET 
        total_system_sales = COALESCE((
          SELECT SUM(amount) FROM public.transactions 
          WHERE project_id = v_project_id 
            AND EXTRACT(YEAR FROM date) = 2024 
            AND EXTRACT(MONTH FROM date) = v_month
            AND type = 'RECEITA'
            AND status = 'REALIZADO'
        ), 0),
        orders_count = COALESCE((
          SELECT COUNT(*) FROM public.transactions 
          WHERE project_id = v_project_id 
            AND EXTRACT(YEAR FROM date) = 2024 
            AND EXTRACT(MONTH FROM date) = v_month
            AND type = 'RECEITA'
            AND status = 'REALIZADO'
        ), 0),
        vendas_capsulas = COALESCE((
          SELECT SUM(amount) FROM public.transactions 
          WHERE project_id = v_project_id 
            AND EXTRACT(YEAR FROM date) = 2024 
            AND EXTRACT(MONTH FROM date) = v_month
            AND type = 'RECEITA'
            AND status = 'REALIZADO'
            AND subcategory ILIKE '%cápsula%'
        ), 0),
        vendas_dermato = COALESCE((
          SELECT SUM(amount) FROM public.transactions 
          WHERE project_id = v_project_id 
            AND EXTRACT(YEAR FROM date) = 2024 
            AND EXTRACT(MONTH FROM date) = v_month
            AND type = 'RECEITA'
            AND status = 'REALIZADO'
            AND subcategory ILIKE '%dermato%'
        ), 0),
        raw_material_costs = COALESCE((
          SELECT SUM(amount) FROM public.transactions 
          WHERE project_id = v_project_id 
            AND EXTRACT(YEAR FROM date) = 2024 
            AND EXTRACT(MONTH FROM date) = v_month
            AND type = 'DESPESA'
            AND status = 'REALIZADO'
            AND (category ILIKE '%matéria%' OR category ILIKE '%materia%')
        ), 0),
        updated_at = NOW()
      WHERE mm.project_id = v_project_id 
        AND mm.year = 2024 
        AND mm.month = v_month;
        
    END LOOP;
  END LOOP;

END $$;
