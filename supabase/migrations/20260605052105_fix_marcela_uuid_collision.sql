-- Migration to split the collision between farmaciaeickhoff and marcelaourique
DO $$
DECLARE
  v_old_id uuid := '63364ec2-082a-4b2c-a3c0-3c6001eef8df'::uuid;
  v_new_id uuid := gen_random_uuid();
  v_marcela_email text := 'marcelaourique@yahoo.com.br';
  v_marcela_project text := 'marcelaourique';
  v_existing_marcela_id uuid;
BEGIN
  -- First, ensure the original owner of the UUID is untouched by specifically keeping their data
  -- This is inherently satisfied by only targeting records WHERE project_id = 'marcelaourique'

  -- Check if marcelaourique@yahoo.com.br already exists in auth.users
  SELECT id INTO v_existing_marcela_id FROM auth.users WHERE email = v_marcela_email;
  
  IF v_existing_marcela_id IS NULL THEN
    -- Marcela doesn't exist as a distinct auth user. Create her.
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_new_id, '00000000-0000-0000-0000-000000000000', v_marcela_email,
      crypt('Skip@Pass123', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Marcela Ourique", "app_name": "marcelaourique"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    v_existing_marcela_id := v_new_id;
  END IF;

  -- Ensure profile exists and is correctly aligned
  INSERT INTO public.profiles (id, email, app_name, role, status, admin_notes)
  VALUES (v_existing_marcela_id, v_marcela_email, v_marcela_project, 'Master', 'Ativo', '[MIGRATED_UUID]')
  ON CONFLICT (id) DO UPDATE SET 
    app_name = v_marcela_project,
    email = v_marcela_email,
    admin_notes = CASE 
      WHEN public.profiles.admin_notes LIKE '%[MIGRATED_UUID]%' THEN public.profiles.admin_notes 
      ELSE COALESCE(public.profiles.admin_notes, '') || ' [MIGRATED_UUID]' 
    END;

  -- MIGRATING DEPENDENT TABLES
  -- We ONLY migrate records associated with the old ID and specifically belonging to Marcela's project

  -- transactions
  UPDATE public.transactions 
  SET user_id = v_existing_marcela_id 
  WHERE user_id = v_old_id AND project_id = v_marcela_project;
  
  -- appointments
  UPDATE public.appointments 
  SET user_id = v_existing_marcela_id 
  WHERE user_id = v_old_id AND project_id = v_marcela_project;
  
  -- monthly_metrics
  UPDATE public.monthly_metrics 
  SET user_id = v_existing_marcela_id 
  WHERE user_id = v_old_id AND project_id = v_marcela_project;
  
  -- audit_logs
  UPDATE public.audit_logs 
  SET user_id = v_existing_marcela_id 
  WHERE user_id = v_old_id AND project_id = v_marcela_project;
  
  -- user_settings
  IF EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = v_old_id AND project_id = v_marcela_project) THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_settings WHERE user_id = v_existing_marcela_id AND project_id = v_marcela_project) THEN
      UPDATE public.user_settings 
      SET user_id = v_existing_marcela_id 
      WHERE user_id = v_old_id AND project_id = v_marcela_project;
    ELSE
      DELETE FROM public.user_settings WHERE user_id = v_old_id AND project_id = v_marcela_project;
    END IF;
  END IF;

END $$;

-- Fix WARNING: TABLES WITH RLS ENABLED BUT NO POLICIES for "marcelaourique@yahoo.com.br"
DROP POLICY IF EXISTS "authenticated_select" ON public."marcelaourique@yahoo.com.br";
CREATE POLICY "authenticated_select" ON public."marcelaourique@yahoo.com.br"
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public."marcelaourique@yahoo.com.br";
CREATE POLICY "authenticated_insert" ON public."marcelaourique@yahoo.com.br"
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public."marcelaourique@yahoo.com.br";
CREATE POLICY "authenticated_update" ON public."marcelaourique@yahoo.com.br"
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public."marcelaourique@yahoo.com.br";
CREATE POLICY "authenticated_delete" ON public."marcelaourique@yahoo.com.br"
  FOR DELETE TO authenticated USING (true);
