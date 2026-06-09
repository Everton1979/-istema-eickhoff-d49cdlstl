DO $$
DECLARE
  v_marcela_id uuid;
  v_marcela_project_id text;
  v_farmacia_id uuid;
  v_farmacia_project_id text;
BEGIN
  -- Identify the user_id and project_id for marcelaourique@yahoo.com.br
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text)
  INTO v_marcela_id, v_marcela_project_id
  FROM public.profiles
  WHERE email = 'marcelaourique@yahoo.com.br'
  LIMIT 1;

  -- Identify the user_id and project_id for farmaciaeickhoff@terra.com.br
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text)
  INTO v_farmacia_id, v_farmacia_project_id
  FROM public.profiles
  WHERE email = 'farmaciaeickhoff@terra.com.br'
  LIMIT 1;

  IF v_marcela_id IS NOT NULL THEN
    -- Update the transactions for 02/04/2026 that have empty, null or '-' in tags
    UPDATE public.transactions
    SET 
      user_id = v_marcela_id,
      project_id = v_marcela_project_id
    WHERE 
      (
        (date AT TIME ZONE 'UTC')::date = '2026-04-02'::date
        OR 
        (date AT TIME ZONE 'America/Sao_Paulo')::date = '2026-04-02'::date
      )
      AND (
        tags IS NULL 
        OR trim(tags) = '' 
        OR trim(tags) = '-'
      )
      AND user_id != v_marcela_id;
  END IF;

  IF v_farmacia_id IS NOT NULL THEN
    -- Ensure transactions for 02/04/2026 with farmaciaeickhoff@terra.com.br in tags 
    -- are assigned to farmaciaeickhoff@terra.com.br
    UPDATE public.transactions
    SET 
      user_id = v_farmacia_id,
      project_id = v_farmacia_project_id
    WHERE 
      (
        (date AT TIME ZONE 'UTC')::date = '2026-04-02'::date
        OR 
        (date AT TIME ZONE 'America/Sao_Paulo')::date = '2026-04-02'::date
      )
      AND tags ILIKE '%farmaciaeickhoff@terra.com.br%'
      AND user_id != v_farmacia_id;
  END IF;
END $$;
