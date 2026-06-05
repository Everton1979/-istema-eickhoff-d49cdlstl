DO $$
DECLARE
  v_old_id uuid;
  v_new_id uuid := gen_random_uuid();
  v_farmacia_id uuid := '63364ec2-082a-4b2c-a3c0-3c6001eef8df'::uuid;
  v_marcela_email text := 'marcelaourique@yahoo.com.br';
  v_marcela_project text := 'marcelaourique';
  v_is_migrated boolean := false;
  v_notes text;
BEGIN
  -- 1. Find the current user_id for Marcela
  SELECT id INTO v_old_id FROM auth.users WHERE email = v_marcela_email;
  
  -- If not found in auth.users, check if she exists in profiles (e.g., pending auth user creation)
  IF v_old_id IS NULL THEN
    SELECT id INTO v_old_id FROM public.profiles WHERE email = v_marcela_email LIMIT 1;
  END IF;

  IF v_old_id IS NOT NULL THEN
    -- Idempotency check to avoid re-generating UUID on consecutive runs
    SELECT admin_notes INTO v_notes FROM public.profiles WHERE id = v_old_id;
    IF v_notes LIKE '%[MIGRATED_UUID]%' THEN
      RETURN;
    END IF;

    IF v_old_id = v_farmacia_id THEN
      -- Extreme edge case: she shares the exact same ID (e.g. auth.identities merge). 
      -- We must create her own user.
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud,
        confirmation_token, recovery_token, email_change_token_new,
        email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
      ) VALUES (
        v_new_id, '00000000-0000-0000-0000-000000000000', v_marcela_email,
        crypt('Skip@Pass123', gen_salt('bf')), NOW(),
        NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Marcela Ourique"}',
        false, 'authenticated', 'authenticated',
        '', '', '', '', '', '', '', ''
      );
      
      -- Profile is auto-created by trigger. Force update with migration flag.
      UPDATE public.profiles 
      SET app_name = v_marcela_project, email = v_marcela_email, admin_notes = COALESCE(admin_notes, '') || ' [MIGRATED_UUID]' 
      WHERE id = v_new_id;
      
      -- Migrate data that specifically belongs to her (identified by project_id)
      UPDATE public.transactions SET user_id = v_new_id WHERE user_id = v_old_id AND project_id = v_marcela_project;
      UPDATE public.appointments SET user_id = v_new_id WHERE user_id = v_old_id AND project_id = v_marcela_project;
      UPDATE public.monthly_metrics SET user_id = v_new_id WHERE user_id = v_old_id AND project_id = v_marcela_project;
      UPDATE public.audit_logs SET user_id = v_new_id WHERE user_id = v_old_id AND project_id = v_marcela_project;
      UPDATE public.user_settings SET user_id = v_new_id 
      WHERE user_id = v_old_id AND project_id = v_marcela_project
      AND NOT EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = v_new_id AND project_id = v_marcela_project);

    ELSE
      -- She has a distinct ID, but we need to assign a NEW UUID and move all her data.
      -- Create the new user with a temp email to avoid unique constraint violation before old user is deleted.
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud,
        confirmation_token, recovery_token, email_change_token_new,
        email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
      )
      SELECT 
        v_new_id, instance_id, 'temp_' || v_new_id || '@yahoo.com.br', encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, role, aud,
        '', '', '', '', '', '', '', ''
      FROM auth.users WHERE id = v_old_id;

      -- Copy her old profile details exactly
      UPDATE public.profiles
      SET 
        role = p.role, status = p.status, app_name = p.app_name, company_name = p.company_name,
        cnpj = p.cnpj, razao_social = p.razao_social, nome_fantasia = p.nome_fantasia,
        endereco = p.endereco, telefone = p.telefone, responsavel = p.responsavel,
        cep = p.cep, logradouro = p.logradouro, numero = p.numero, complemento = p.complemento,
        bairro = p.bairro, cidade_estado = p.cidade_estado, plan_type = p.plan_type,
        plan_start_date = p.plan_start_date, plan_end_date = p.plan_end_date
      FROM (SELECT * FROM public.profiles WHERE id = v_old_id) p
      WHERE public.profiles.id = v_new_id;

      -- Migrate all associated records from old UUID to new UUID
      UPDATE public.transactions SET user_id = v_new_id WHERE user_id = v_old_id;
      UPDATE public.appointments SET user_id = v_new_id WHERE user_id = v_old_id;
      UPDATE public.monthly_metrics SET user_id = v_new_id WHERE user_id = v_old_id;
      UPDATE public.audit_logs SET user_id = v_new_id WHERE user_id = v_old_id;
      UPDATE public.user_settings SET user_id = v_new_id 
      WHERE user_id = v_old_id
      AND NOT EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = v_new_id AND project_id = public.user_settings.project_id);

      -- Delete the old user (cascades to old profile)
      DELETE FROM auth.users WHERE id = v_old_id;

      -- Set the email on the new user back to the correct email and flag as migrated
      UPDATE auth.users SET email = v_marcela_email WHERE id = v_new_id;
      UPDATE public.profiles 
      SET email = v_marcela_email, admin_notes = COALESCE(admin_notes, '') || ' [MIGRATED_UUID]' 
      WHERE id = v_new_id;
    END IF;
  ELSE
    -- User doesn't exist, create from scratch
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_new_id, '00000000-0000-0000-0000-000000000000', v_marcela_email,
      crypt('Skip@Pass123', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Marcela Ourique"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', '', '', ''
    );
    
    UPDATE public.profiles 
    SET app_name = v_marcela_project, email = v_marcela_email, admin_notes = COALESCE(admin_notes, '') || ' [MIGRATED_UUID]' 
    WHERE id = v_new_id;
    
    -- Pick up any orphaned records that might belong to her
    UPDATE public.transactions SET user_id = v_new_id WHERE project_id = v_marcela_project AND user_id != v_new_id;
    UPDATE public.appointments SET user_id = v_new_id WHERE project_id = v_marcela_project AND user_id != v_new_id;
    UPDATE public.monthly_metrics SET user_id = v_new_id WHERE project_id = v_marcela_project AND user_id != v_new_id;
    UPDATE public.audit_logs SET user_id = v_new_id WHERE project_id = v_marcela_project AND user_id != v_new_id;
    UPDATE public.user_settings SET user_id = v_new_id 
    WHERE project_id = v_marcela_project AND user_id != v_new_id
    AND NOT EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = v_new_id AND project_id = v_marcela_project);
  END IF;
END $$;
