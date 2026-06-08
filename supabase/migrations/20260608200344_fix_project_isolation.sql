-- Set app_name to CNPJ for users that have CNPJ but app_name is still default or null
UPDATE public.profiles
SET app_name = regexp_replace(cnpj, '\D', '', 'g')
WHERE cnpj IS NOT NULL AND (app_name = 'farmacia_eickhoff' OR app_name IS NULL);

-- Explicitly set the main user to the correct CNPJ
UPDATE public.profiles
SET app_name = '02671419000109', cnpj = COALESCE(cnpj, '02671419000109')
WHERE email = 'farmaciaeickhoff@terra.com.br';

-- Also update any profile that had 'farmacia_eickhoff' to the main CNPJ if we assume they were part of that team
UPDATE public.profiles
SET app_name = '02671419000109'
WHERE app_name = 'farmacia_eickhoff';

-- Update transactions to map strictly to the profile app_name associated with the creator user
UPDATE public.transactions t
SET project_id = p.app_name
FROM public.profiles p
WHERE t.user_id = p.id AND t.project_id != p.app_name AND p.app_name IS NOT NULL;

-- Update monthly_metrics to map strictly to the profile app_name associated with the creator user
UPDATE public.monthly_metrics m
SET project_id = p.app_name
FROM public.profiles p
WHERE m.user_id = p.id AND m.project_id != p.app_name AND p.app_name IS NOT NULL;

-- Update user_settings
UPDATE public.user_settings s
SET project_id = p.app_name
FROM public.profiles p
WHERE s.user_id = p.id AND s.project_id != p.app_name AND p.app_name IS NOT NULL;

-- Update appointments
UPDATE public.appointments a
SET project_id = p.app_name
FROM public.profiles p
WHERE a.user_id = p.id AND a.project_id != p.app_name AND p.app_name IS NOT NULL;

-- Update audit_logs
UPDATE public.audit_logs l
SET project_id = p.app_name
FROM public.profiles p
WHERE l.user_id = p.id AND l.project_id != p.app_name AND p.app_name IS NOT NULL;

-- RLS Function Hardening: Return strictly the app_name from the profile, no fallback that shares data
CREATE OR REPLACE FUNCTION public.get_user_app_name()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT app_name FROM public.profiles WHERE id = auth.uid();
$function$;

-- Update the set_project_id trigger function
CREATE OR REPLACE FUNCTION public.set_project_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Use get_user_app_name() and fall back to NEW.project_id
  NEW.project_id := COALESCE(public.get_user_app_name(), NEW.project_id);
  RETURN NEW;
END;
$function$;

-- Update the handle_new_user function to not use hardcoded default for new profiles
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
BEGIN
  v_cnpj := NEW.raw_user_meta_data->>'cnpj';
  v_app_name := COALESCE(NEW.raw_user_meta_data->>'app_name', regexp_replace(v_cnpj, '\D', '', 'g'));
  
  IF v_app_name IS NULL OR v_app_name = '' THEN
    v_app_name := NEW.id::text;
  END IF;

  SELECT count(*) INTO v_count FROM public.profiles WHERE app_name = v_app_name;

  IF v_count = 0 THEN
    v_role := 'Administrador';
    v_status := 'Ativo';
  ELSE
    IF NEW.email = 'farmaciaeickhoff@terra.com.br' THEN
      v_role := 'Administrador';
      v_status := 'Ativo';
    ELSE
      v_role := 'Master';
      v_status := 'Pendente';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, email, role, status, cnpj, razao_social, nome_fantasia, 
    endereco, telefone, responsavel, cep, logradouro, numero, complemento, bairro, cidade_estado, app_name
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
    v_app_name
  );
  RETURN NEW;
END;
$function$;
