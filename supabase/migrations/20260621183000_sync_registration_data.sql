CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    app_name, 
    role, 
    status,
    company_name,
    cnpj,
    razao_social,
    nome_fantasia,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade_estado,
    telefone,
    responsavel
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'app_name', NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Usuário'),
    'Pendente',
    COALESCE(NEW.raw_user_meta_data->>'nome_fantasia', NEW.raw_user_meta_data->>'company_name'),
    NEW.raw_user_meta_data->>'cnpj',
    NEW.raw_user_meta_data->>'razao_social',
    NEW.raw_user_meta_data->>'nome_fantasia',
    NEW.raw_user_meta_data->>'cep',
    NEW.raw_user_meta_data->>'logradouro',
    NEW.raw_user_meta_data->>'numero',
    NEW.raw_user_meta_data->>'complemento',
    NEW.raw_user_meta_data->>'bairro',
    NEW.raw_user_meta_data->>'cidade_estado',
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'responsavel'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    app_name = EXCLUDED.app_name,
    company_name = EXCLUDED.company_name,
    cnpj = EXCLUDED.cnpj,
    razao_social = EXCLUDED.razao_social,
    nome_fantasia = EXCLUDED.nome_fantasia,
    cep = EXCLUDED.cep,
    logradouro = EXCLUDED.logradouro,
    numero = EXCLUDED.numero,
    complemento = EXCLUDED.complemento,
    bairro = EXCLUDED.bairro,
    cidade_estado = EXCLUDED.cidade_estado,
    telefone = EXCLUDED.telefone,
    responsavel = EXCLUDED.responsavel;

  INSERT INTO public.user_settings (user_id, project_id)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'app_name', NEW.id::text)
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles from raw_user_meta_data
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, raw_user_meta_data FROM auth.users WHERE raw_user_meta_data IS NOT NULL LOOP
    UPDATE public.profiles
    SET 
      company_name = COALESCE(profiles.company_name, r.raw_user_meta_data->>'nome_fantasia', r.raw_user_meta_data->>'company_name'),
      cnpj = COALESCE(profiles.cnpj, r.raw_user_meta_data->>'cnpj'),
      razao_social = COALESCE(profiles.razao_social, r.raw_user_meta_data->>'razao_social'),
      nome_fantasia = COALESCE(profiles.nome_fantasia, r.raw_user_meta_data->>'nome_fantasia'),
      cep = COALESCE(profiles.cep, r.raw_user_meta_data->>'cep'),
      logradouro = COALESCE(profiles.logradouro, r.raw_user_meta_data->>'logradouro'),
      numero = COALESCE(profiles.numero, r.raw_user_meta_data->>'numero'),
      complemento = COALESCE(profiles.complemento, r.raw_user_meta_data->>'complemento'),
      bairro = COALESCE(profiles.bairro, r.raw_user_meta_data->>'bairro'),
      cidade_estado = COALESCE(profiles.cidade_estado, r.raw_user_meta_data->>'cidade_estado'),
      telefone = COALESCE(profiles.telefone, r.raw_user_meta_data->>'telefone'),
      responsavel = COALESCE(profiles.responsavel, r.raw_user_meta_data->>'responsavel')
    WHERE id = r.id;
  END LOOP;
END $$;
