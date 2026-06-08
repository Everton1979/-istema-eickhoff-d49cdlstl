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
