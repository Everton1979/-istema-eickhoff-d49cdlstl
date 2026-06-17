-- Fix Master User Visibility and Default Pending Status

DO $$
BEGIN
  -- 1. Ensure Master User Identification
  UPDATE public.profiles
  SET 
    role = 'Master',
    is_super_admin = true
  WHERE email = 'farmaciaeickhoff@terra.com.br';

  -- 2. Fix Existing Data
  -- Ensure evertoneickhoff@terra.com.br has 'Pendente' status so it appears in the list
  UPDATE public.profiles
  SET status = 'Pendente'
  WHERE email = 'evertoneickhoff@terra.com.br';
  
  -- Also fix any null statuses for other profiles to ensure they appear in lists
  UPDATE public.profiles
  SET status = 'Pendente'
  WHERE status IS NULL;
END $$;

-- 3. Trigger Update (handle_new_user)
-- Explicitly set status = 'Pendente' and role = 'Administrador' for all new signups
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
    -- ALWAYS set 'Pendente' and 'Administrador' by default for new signups
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

-- 4. Enhanced Read/Update Policies (profiles)
-- Allow Master users and Super Admins to read and update ALL profiles
DO $$
BEGIN
  -- Recreate read policy
  DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
  CREATE POLICY "Users can read profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid() 
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    );

  -- Recreate update policy
  DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
  CREATE POLICY "Users can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid() 
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    )
    WITH CHECK (
      id = auth.uid() 
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND app_name = get_user_app_name())
    );
END $$;
