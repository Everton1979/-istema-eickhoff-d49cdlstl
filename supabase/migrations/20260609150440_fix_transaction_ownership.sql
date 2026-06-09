DO $$
DECLARE
  v_farmacia_id uuid;
  v_farmacia_app_name text;
  v_marcela_id uuid;
  v_marcela_app_name text;
BEGIN
  -- Fetch Farmácia Eickhoff profile data
  SELECT id, app_name INTO v_farmacia_id, v_farmacia_app_name
  FROM public.profiles
  WHERE email = 'farmaciaeickhoff@terra.com.br'
  LIMIT 1;

  -- Fetch Marcela Ourique profile data
  SELECT id, app_name INTO v_marcela_id, v_marcela_app_name
  FROM public.profiles
  WHERE email = 'marcelaourique@yahoo.com.br'
  LIMIT 1;

  -- Assignment Rule - Farmácia Eickhoff
  IF v_farmacia_id IS NOT NULL THEN
    UPDATE public.transactions
    SET 
      user_id = v_farmacia_id,
      project_id = COALESCE(NULLIF(v_farmacia_app_name, ''), v_farmacia_id::text)
    WHERE 
      date >= '2026-04-01 00:00:00+00'::timestamptz 
      AND date <= '2026-04-11 23:59:59+00'::timestamptz
      AND (
        description ILIKE '%farmaciaeickhoff@terra.com.br%' 
        OR tags ILIKE '%farmaciaeickhoff@terra.com.br%'
      )
      AND (
        user_id != v_farmacia_id 
        OR project_id != COALESCE(NULLIF(v_farmacia_app_name, ''), v_farmacia_id::text)
      );
  END IF;

  -- Assignment Rule - Marcela Ourique
  IF v_marcela_id IS NOT NULL THEN
    UPDATE public.transactions
    SET 
      user_id = v_marcela_id,
      project_id = COALESCE(NULLIF(v_marcela_app_name, ''), v_marcela_id::text)
    WHERE 
      date >= '2026-04-01 00:00:00+00'::timestamptz 
      AND date <= '2026-04-11 23:59:59+00'::timestamptz
      AND (description IS NULL OR trim(description) = '')
      AND (tags IS NULL OR trim(tags) = '')
      AND (
        user_id != v_marcela_id 
        OR project_id != COALESCE(NULLIF(v_marcela_app_name, ''), v_marcela_id::text)
      );
  END IF;

END $$;
