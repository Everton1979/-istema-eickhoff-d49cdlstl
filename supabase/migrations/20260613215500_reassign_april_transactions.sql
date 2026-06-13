DO $$
DECLARE
  farmacia_id uuid;
  farmacia_app_name text;
  marcela_id uuid;
  marcela_app_name text;
BEGIN
  -- Retrieve Farmacia Eickhoff profile
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text) 
  INTO farmacia_id, farmacia_app_name
  FROM public.profiles
  WHERE email = 'farmaciaeickhoff@terra.com.br'
  LIMIT 1;

  -- Retrieve Marcela Ourique profile
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text) 
  INTO marcela_id, marcela_app_name
  FROM public.profiles
  WHERE email = 'marcelaourique@yahoo.com.br'
  LIMIT 1;

  -- Ensure both users exist before proceeding
  IF farmacia_id IS NULL OR marcela_id IS NULL THEN
    RAISE NOTICE 'Target users not found. Skipping transaction reassignment.';
    RETURN;
  END IF;

  -- 1. Reassign transactions to Farmacia Eickhoff
  UPDATE public.transactions
  SET 
    user_id = farmacia_id,
    project_id = farmacia_app_name
  WHERE 
    date >= '2026-04-13 00:00:00-03' AND date <= '2026-04-30 23:59:59-03'
    AND (
      COALESCE(tags, '') ILIKE '%farmaciaeickhoff@terra.com.br%' 
      OR description ILIKE '%farmaciaeickhoff@terra.com.br%'
    );

  -- 2. Reassign transactions to Marcela Ourique
  UPDATE public.transactions
  SET 
    user_id = marcela_id,
    project_id = marcela_app_name
  WHERE 
    date >= '2026-04-13 00:00:00-03' AND date <= '2026-04-30 23:59:59-03'
    AND NOT (
      COALESCE(tags, '') ILIKE '%farmaciaeickhoff@terra.com.br%' 
      OR description ILIKE '%farmaciaeickhoff@terra.com.br%'
    );

END $$;
