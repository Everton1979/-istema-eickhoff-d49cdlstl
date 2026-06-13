DO $$
DECLARE
  v_marcela_id uuid;
  v_marcela_app_name text;
  v_farmacia_id uuid;
BEGIN
  -- 1. Identify users
  SELECT id INTO v_marcela_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br' LIMIT 1;
  SELECT id INTO v_farmacia_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;

  -- 2. Transaction Reassignment for dates between 2026-04-13 and 2026-04-30
  IF v_marcela_id IS NOT NULL THEN
    -- Get Marcela's project_id / app_name
    SELECT COALESCE(NULLIF(app_name, ''), id::text) INTO v_marcela_app_name FROM public.profiles WHERE id = v_marcela_id;
    
    IF v_marcela_app_name IS NULL THEN
      v_marcela_app_name := v_marcela_id::text;
    END IF;

    -- Update transactions that do NOT contain the specific email
    UPDATE public.transactions
    SET 
      user_id = v_marcela_id,
      project_id = v_marcela_app_name
    WHERE date >= '2026-04-13 00:00:00'::timestamp with time zone 
      AND date <= '2026-04-30 23:59:59'::timestamp with time zone
      AND COALESCE(description, '') NOT ILIKE '%farmaciaeickhoff@terra.com.br%' 
      AND COALESCE(tags, '') NOT ILIKE '%farmaciaeickhoff@terra.com.br%'
      AND user_id != v_marcela_id;
  END IF;

  -- 3. User Role Configuration
  -- Set Master Account (Super Admin)
  IF v_farmacia_id IS NOT NULL THEN
    UPDATE public.profiles
    SET 
      role = 'Master',
      is_super_admin = true
    WHERE id = v_farmacia_id;
  END IF;

  -- Set Local Administrators (everyone else)
  UPDATE public.profiles
  SET 
    role = 'Administrador',
    is_super_admin = false
  WHERE email != 'farmaciaeickhoff@terra.com.br' OR email IS NULL;

END $$;

-- 4. Update the trigger function handle_new_user() to reflect the new role distribution
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_app_name text;
  v_role text;
  v_status text;
  v_count int;
  v_cnpj text;
  v_is_super_admin boolean;
BEGIN
  v_cnpj := NEW.raw_user_meta_data->>'cnpj';
  
  -- Prioritize app_name from metadata, fallback to sanitized CNPJ, fallback to new user ID
  v_app_name := NEW.raw_user_meta_data->>'app_name';
  IF v_app_name IS NULL OR v_app_name = '' THEN
    IF v_cnpj IS NOT NULL AND v_cnpj <> '' THEN
      v_app_name := regexp_replace(v_cnpj, '\D', '', 'g');
    ELSE
      v_app_name := NEW.id::text;
    END IF;
  END IF;

  -- Check if any profile already exists for this app_name
  SELECT count(*) INTO v_count FROM public.profiles WHERE app_name = v_app_name;

  IF NEW.email = 'farmaciaeickhoff@terra.com.br' THEN
    v_role := 'Master';
    v_status := 'Ativo';
    v_is_super_admin := true;
  ELSE
    IF v_count = 0 THEN
      v_role := 'Administrador';
      v_status := 'Ativo';
    ELSE
      v_role := 'Administrador';
      v_status := 'Pendente';
    END IF;
    v_is_super_admin := false;
  END IF;

  INSERT INTO public.profiles (
    id, email, role, status, cnpj, razao_social, nome_fantasia, 
    endereco, telefone, responsavel, cep, logradouro, numero, complemento, bairro, cidade_estado, app_name, is_super_admin
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_role,
    v_status,
    v_cnpj,
    NEW.raw_user_meta_data->>'razao_social',
    NEW.raw_user_meta_data->>'nome_fantasia',
    NEW.raw_user_meta_data->>'endereco',
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'responsavel',
    NEW.raw_user_meta_data->>'cep',
    NEW.raw_user_meta_data->>'logradouro',
    NEW.raw_user_meta_data->>'numero',
    NEW.raw_user_meta_data->>'complemento',
    NEW.raw_user_meta_data->>'bairro',
    NEW.raw_user_meta_data->>'cidade_estado',
    v_app_name,
    v_is_super_admin
  );
  RETURN NEW;
END;
$function$;

-- 5. Update RLS policies to grant global visibility to Super Admins across main tables
-- TRANSACTIONS
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT TO authenticated 
  USING (
    is_super_admin() OR 
    (
      (project_id = get_user_app_name()) AND 
      ((get_user_status() = 'Ativo') OR (get_user_role() = ANY (ARRAY['Administrador', 'Master'])))
    )
  );

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT TO authenticated 
  WITH CHECK (
    is_super_admin() OR 
    (
      (project_id = get_user_app_name()) AND 
      (user_id = auth.uid()) AND 
      ((get_user_status() = 'Ativo') OR (get_user_role() = ANY (ARRAY['Administrador', 'Master'])))
    )
  );

DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE TO authenticated 
  USING (
    is_super_admin() OR 
    (
      (project_id = get_user_app_name()) AND 
      ((user_id = auth.uid()) OR (get_user_role() = ANY (ARRAY['Administrador', 'Master']))) AND 
      ((get_user_status() = 'Ativo') OR (get_user_role() = ANY (ARRAY['Administrador', 'Master'])))
    )
  )
  WITH CHECK (
    is_super_admin() OR (project_id = get_user_app_name())
  );

DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE TO authenticated 
  USING (
    is_super_admin() OR 
    (
      (project_id = get_user_app_name()) AND 
      ((user_id = auth.uid()) OR (get_user_role() = ANY (ARRAY['Administrador', 'Master']))) AND 
      ((get_user_status() = 'Ativo') OR (get_user_role() = ANY (ARRAY['Administrador', 'Master'])))
    )
  );

-- MONTHLY METRICS
DROP POLICY IF EXISTS "monthly_metrics_select" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_select" ON public.monthly_metrics
  FOR SELECT TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "monthly_metrics_insert" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_insert" ON public.monthly_metrics
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "monthly_metrics_update" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_update" ON public.monthly_metrics
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())))
  WITH CHECK (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "monthly_metrics_delete" ON public.monthly_metrics;
CREATE POLICY "monthly_metrics_delete" ON public.monthly_metrics
  FOR DELETE TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

-- APPOINTMENTS
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
CREATE POLICY "appointments_insert" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
CREATE POLICY "appointments_update" ON public.appointments
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())))
  WITH CHECK (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;
CREATE POLICY "appointments_delete" ON public.appointments
  FOR DELETE TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

-- USER SETTINGS
DROP POLICY IF EXISTS "user_settings_select" ON public.user_settings;
CREATE POLICY "user_settings_select" ON public.user_settings
  FOR SELECT TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "user_settings_insert" ON public.user_settings;
CREATE POLICY "user_settings_insert" ON public.user_settings
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "user_settings_update" ON public.user_settings;
CREATE POLICY "user_settings_update" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())))
  WITH CHECK (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));

DROP POLICY IF EXISTS "user_settings_delete" ON public.user_settings;
CREATE POLICY "user_settings_delete" ON public.user_settings
  FOR DELETE TO authenticated
  USING (is_super_admin() OR ((user_id = auth.uid()) AND (project_id = get_user_app_name())));
