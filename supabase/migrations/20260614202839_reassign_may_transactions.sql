DO $$
DECLARE
  master_id uuid;
  master_app_name text;
  marcela_id uuid;
  marcela_app_name text;
BEGIN
  -- Get Master details
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text)
  INTO master_id, master_app_name
  FROM public.profiles
  WHERE email = 'farmaciaeickhoff@terra.com.br'
  LIMIT 1;

  -- Get Marcela details
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text)
  INTO marcela_id, marcela_app_name
  FROM public.profiles
  WHERE email = 'marcelaourique@yahoo.com.br'
  LIMIT 1;

  IF master_id IS NOT NULL AND marcela_id IS NOT NULL THEN
    -- Update transactions for Master
    UPDATE public.transactions
    SET 
      user_id = master_id,
      project_id = master_app_name
    WHERE 
      CAST(date AT TIME ZONE 'America/Sao_Paulo' AS date) >= '2026-05-01'::date 
      AND CAST(date AT TIME ZONE 'America/Sao_Paulo' AS date) <= '2026-05-31'::date
      AND tags ILIKE '%farmaciaeickhoff@terra.com.br%';

    -- Update transactions for Marcela
    UPDATE public.transactions
    SET 
      user_id = marcela_id,
      project_id = marcela_app_name
    WHERE 
      CAST(date AT TIME ZONE 'America/Sao_Paulo' AS date) >= '2026-05-01'::date 
      AND CAST(date AT TIME ZONE 'America/Sao_Paulo' AS date) <= '2026-05-31'::date
      AND (tags NOT ILIKE '%farmaciaeickhoff@terra.com.br%' OR tags IS NULL);
  END IF;
END $$;
