-- Force all new users to be Pendente by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, email, role, status, cnpj, razao_social, nome_fantasia, 
    endereco, telefone, responsavel, cep, logradouro, numero, complemento, bairro, cidade_estado, app_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'farmaciaeickhoff@terra.com.br' THEN 'Administrador' ELSE 'Usuário' END,
    -- Garante que todo novo usuário receba status Pendente como padrão absoluto
    'Pendente',
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
    COALESCE(NEW.raw_user_meta_data->>'app_name', 'farmacia') 
  );
  RETURN NEW;
END;
$function$;
