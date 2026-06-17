DO $$
DECLARE
  master_user_id uuid;
BEGIN
  -- 1. Seed master user (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br') THEN
    master_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      master_user_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO master_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  END IF;

  -- Ensure profile exists and is Master
  INSERT INTO public.profiles (id, email, role, status, is_super_admin, app_name)
  VALUES (master_user_id, 'farmaciaeickhoff@terra.com.br', 'Master', 'Ativo', true, master_user_id::text)
  ON CONFLICT (id) DO UPDATE SET 
    role = 'Master',
    status = 'Ativo',
    is_super_admin = true;
END $$;

-- 2. Fix data consistency
UPDATE public.profiles
SET status = 'Pendente'
WHERE (status IS NULL OR status = '')
  AND email != 'farmaciaeickhoff@terra.com.br';

-- 3. Update RLS policies to fix recursion and grant Master full visibility
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() 
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    OR is_super_admin()
    OR (get_user_role() = 'Master')
  );

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() 
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    OR is_super_admin()
    OR (get_user_role() = 'Master')
  )
  WITH CHECK (
    id = auth.uid() 
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    OR is_super_admin()
    OR (get_user_role() = 'Master')
  );

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid() 
    OR (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    OR is_super_admin() 
    OR get_user_role() = 'Master' 
    OR ((get_user_role() = 'Administrador'::text) AND app_name = get_user_app_name())
  );

DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;
CREATE POLICY "Users can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br')
    OR is_super_admin() 
    OR get_user_role() = 'Master' 
    OR ((get_user_role() = 'Administrador'::text) AND app_name = get_user_app_name())
  );

-- 4. Update trigger to explicitly set Pendente and Administrador
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_app_name text;
  v_role text;
  v_status text;
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

  IF NEW.email = 'farmaciaeickhoff@terra.com.br' THEN
    v_role := 'Master';
    v_status := 'Ativo';
    v_is_super_admin := true;
  ELSE
    -- Explicitly set to Pendente and Administrador
    v_role := 'Administrador';
    v_status := 'Pendente';
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
