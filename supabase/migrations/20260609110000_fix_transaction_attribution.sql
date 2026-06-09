DO $$
DECLARE
  v_source_user_id uuid;
  v_target_user_id uuid;
  v_target_project_id text;
BEGIN
  -- 1. Identify users
  SELECT id INTO v_source_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
  
  IF v_source_user_id IS NOT NULL THEN
    SELECT id INTO v_target_user_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br';
    
    -- If target user exists, proceed with reassignment
    IF v_target_user_id IS NOT NULL THEN
      -- Get target project ID
      SELECT app_name INTO v_target_project_id FROM public.profiles WHERE id = v_target_user_id;
      
      -- Fallback to user ID if app_name is not set
      IF v_target_project_id IS NULL OR v_target_project_id = '' THEN 
        v_target_project_id := v_target_user_id::text; 
      END IF;

      -- Update transactions for "prefeitura" and "taxas" matching the exact amounts
      UPDATE public.transactions
      SET 
        user_id = v_target_user_id, 
        project_id = v_target_project_id
      WHERE 
        user_id = v_source_user_id 
        AND (
          (description ILIKE '%prefeitura%' AND amount = 1129.24) OR
          (description ILIKE '%taxas%' AND amount = 581.13)
        );
    END IF;
  END IF;
END $$;
