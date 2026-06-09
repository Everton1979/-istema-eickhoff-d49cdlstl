DO $$
DECLARE
  v_marcela_id uuid;
  v_marcela_project_id text;
BEGIN
  -- Identify the user_id and project_id for marcelaoutrique@yahoo.com.br
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text)
  INTO v_marcela_id, v_marcela_project_id
  FROM public.profiles
  WHERE email = 'marcelaoutrique@yahoo.com.br'
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
END $$;
