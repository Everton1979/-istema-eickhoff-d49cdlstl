DO $$
DECLARE
  v_main_user_id uuid;
  v_main_project_id text;
  v_marcela_user_id uuid;
  v_marcela_project_id text;
BEGIN
  -- 1. Identify users
  SELECT id INTO v_main_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  SELECT id INTO v_marcela_user_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br' LIMIT 1;

  -- 2. Project ID Sync for main account
  IF v_main_user_id IS NOT NULL THEN
    SELECT COALESCE(NULLIF(app_name, ''), id::text) INTO v_main_project_id FROM public.profiles WHERE id = v_main_user_id;
    
    IF v_main_project_id IS NOT NULL THEN
      -- Sync transactions
      UPDATE public.transactions
      SET project_id = v_main_project_id
      WHERE user_id = v_main_user_id AND project_id != v_main_project_id;
      
      -- Sync monthly_metrics
      UPDATE public.monthly_metrics
      SET project_id = v_main_project_id
      WHERE user_id = v_main_user_id AND project_id != v_main_project_id;
      
      -- Sync appointments
      UPDATE public.appointments
      SET project_id = v_main_project_id
      WHERE user_id = v_main_user_id AND project_id != v_main_project_id;

      -- Ensure monthly_metrics exist for April and May 2026
      INSERT INTO public.monthly_metrics (user_id, project_id, month, year)
      VALUES 
        (v_main_user_id, v_main_project_id, 4, 2026),
        (v_main_user_id, v_main_project_id, 5, 2026)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- 3. Specific Record Reassignment
  IF v_marcela_user_id IS NOT NULL THEN
    SELECT COALESCE(NULLIF(app_name, ''), id::text) INTO v_marcela_project_id FROM public.profiles WHERE id = v_marcela_user_id;
    
    IF v_marcela_project_id IS NOT NULL THEN
      -- Reassign prefeitura (1129.24)
      UPDATE public.transactions
      SET user_id = v_marcela_user_id, project_id = v_marcela_project_id
      WHERE amount = 1129.24 AND description ILIKE '%prefeitura%';

      -- Reassign taxas (581.13)
      UPDATE public.transactions
      SET user_id = v_marcela_user_id, project_id = v_marcela_project_id
      WHERE amount = 581.13 AND description ILIKE '%taxas%';
    END IF;
  END IF;

  -- 4. Verify Main Account Record (mauricio - 200.00)
  IF v_main_user_id IS NOT NULL AND v_main_project_id IS NOT NULL THEN
    UPDATE public.transactions
    SET user_id = v_main_user_id, project_id = v_main_project_id
    WHERE amount = 200.00 AND description ILIKE '%mauricio%';
  END IF;

END $$;
