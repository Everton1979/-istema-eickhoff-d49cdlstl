-- 1. Update handle_new_user() function to handle dynamic app_name and first-user admin rule
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
BEGIN
  v_app_name := COALESCE(NEW.raw_user_meta_data->>'app_name', 'farmacia_eickhoff');

  -- Check if any profile already exists for this app_name
  SELECT count(*) INTO v_count FROM public.profiles WHERE app_name = v_app_name;

  IF v_count = 0 THEN
    -- First user of the company gets administrative privileges automatically
    v_role := 'Administrador';
    v_status := 'Ativo';
  ELSE
    -- Subsequent users
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
    NEW.raw_user_meta_data->>'cnpj',
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
$function$
;

-- 2. Data Correction Migration for marcelaourique@yahoo.com.br
DO $$
DECLARE
  v_user_id uuid;
  v_new_app_name text := 'tenant_02671419000109';
BEGIN
  SELECT id INTO v_user_id FROM public.profiles WHERE email = 'marcelaourique@yahoo.com.br';
  
  IF v_user_id IS NOT NULL THEN
    -- Update profile
    UPDATE public.profiles 
    SET cnpj = '02671419000109', 
        app_name = v_new_app_name 
    WHERE id = v_user_id;

    -- Update auth.users metadata for consistency
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{app_name}',
          to_jsonb(v_new_app_name)
        )
    WHERE id = v_user_id;

    -- Update related tables so the user doesn't lose access to their existing data under the new isolated tenant
    UPDATE public.transactions SET project_id = v_new_app_name WHERE user_id = v_user_id;
    UPDATE public.appointments SET project_id = v_new_app_name WHERE user_id = v_user_id;
    UPDATE public.monthly_metrics SET project_id = v_new_app_name WHERE user_id = v_user_id;
    UPDATE public.audit_logs SET project_id = v_new_app_name WHERE user_id = v_user_id;
    
    -- Handle user_settings which has a composite primary key (user_id, project_id)
    BEGIN
      UPDATE public.user_settings SET project_id = v_new_app_name WHERE user_id = v_user_id AND project_id = 'farmacia_eickhoff';
    EXCEPTION WHEN unique_violation THEN
      DELETE FROM public.user_settings WHERE user_id = v_user_id AND project_id = 'farmacia_eickhoff';
    END;

    -- Handle users table which also has a potential unique constraint
    BEGIN
      UPDATE public.users SET project_id = v_new_app_name WHERE user_id = v_user_id AND project_id = 'farmacia_eickhoff';
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END IF;
END $$;
