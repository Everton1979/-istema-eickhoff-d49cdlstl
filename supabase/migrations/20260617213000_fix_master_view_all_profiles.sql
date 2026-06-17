DO $BODY$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;

  -- Recreate read policy to allow Master and super_admin to see all profiles unconditionally
  CREATE POLICY "Users can read profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid() 
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR (auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'
      OR (get_user_role() = 'Administrador' AND app_name = get_user_app_name())
    );

  -- Recreate update policy to allow Master and super_admin to update all profiles unconditionally
  CREATE POLICY "Users can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid() 
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR (auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'
      OR (get_user_role() = 'Administrador' AND app_name = get_user_app_name())
    )
    WITH CHECK (
      id = auth.uid() 
      OR is_super_admin()
      OR get_user_role() = 'Master'
      OR (auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'
      OR (get_user_role() = 'Administrador' AND app_name = get_user_app_name())
    );
END $BODY$;

-- Fix existing data: set status to 'Pendente' where it's NULL or empty
UPDATE public.profiles
SET status = 'Pendente'
WHERE (status IS NULL OR status = '')
  AND email != 'farmaciaeickhoff@terra.com.br';

-- Make sure evertoneickhoff@terra.com.br is correctly set
UPDATE public.profiles
SET status = 'Pendente'
WHERE email = 'evertoneickhoff@terra.com.br';

-- Re-apply handle_new_user to ensure no NULL status is ever assigned
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
