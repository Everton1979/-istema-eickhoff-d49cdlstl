DO $$
DECLARE
  v_user1_id uuid;
  v_user1_app text;
  v_user2_id uuid;
  v_user2_app text;
BEGIN
  -- Get user 1 details (farmaciaeickhoff@terra.com.br)
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text)
  INTO v_user1_id, v_user1_app 
  FROM public.profiles 
  WHERE email = 'farmaciaeickhoff@terra.com.br' 
  LIMIT 1;

  -- Get user 2 details (marcelaourique@yahoo.com.br)
  SELECT id, COALESCE(NULLIF(app_name, ''), id::text)
  INTO v_user2_id, v_user2_app 
  FROM public.profiles 
  WHERE email = 'marcelaourique@yahoo.com.br' 
  LIMIT 1;

  -- Update attribution for User 1 based on the observation tag containing their email
  IF v_user1_id IS NOT NULL THEN
    UPDATE public.transactions
    SET 
      user_id = v_user1_id,
      project_id = v_user1_app
    WHERE 
      date >= '2026-04-01 00:00:00-03'::timestamptz 
      AND date <= '2026-04-11 23:59:59-03'::timestamptz
      AND tags LIKE '%farmaciaeickhoff@terra.com.br%'
      AND (user_id != v_user1_id OR project_id != v_user1_app);
  END IF;

  -- Update attribution for User 2 where observation tag is empty or null
  IF v_user2_id IS NOT NULL THEN
    UPDATE public.transactions
    SET 
      user_id = v_user2_id,
      project_id = v_user2_app
    WHERE 
      date >= '2026-04-01 00:00:00-03'::timestamptz 
      AND date <= '2026-04-11 23:59:59-03'::timestamptz
      AND (tags IS NULL OR trim(tags) = '')
      AND (user_id != v_user2_id OR project_id != v_user2_app);
  END IF;

END $$;
