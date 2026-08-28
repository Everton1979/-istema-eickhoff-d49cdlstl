-- Add access_profile column to profiles table with default 'Proprietário'
-- Allowed values: 'Proprietário', 'Gerente', 'Colaborador'
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS access_profile TEXT DEFAULT 'Proprietário';

-- Update existing records to default to 'Proprietário' if null
UPDATE public.profiles
SET access_profile = 'Proprietário'
WHERE access_profile IS NULL;

-- Update handle_new_user trigger to preserve access_profile from raw_user_meta_data if passed, or default to 'Proprietário'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    company_name,
    cnpj,
    razao_social,
    nome_fantasia,
    endereco,
    telefone,
    responsavel,
    status,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade_estado,
    app_name,
    approved_at,
    plan_type,
    plan_start_date,
    plan_end_date,
    admin_notes,
    is_super_admin,
    access_profile
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'Administrador'),
    COALESCE(new.raw_user_meta_data->>'company_name', new.raw_user_meta_data->>'companyName', ''),
    COALESCE(new.raw_user_meta_data->>'cnpj', ''),
    COALESCE(new.raw_user_meta_data->>'razao_social', new.raw_user_meta_data->>'razaoSocial', ''),
    COALESCE(new.raw_user_meta_data->>'nome_fantasia', new.raw_user_meta_data->>'nomeFantasia', ''),
    COALESCE(new.raw_user_meta_data->>'endereco', ''),
    COALESCE(new.raw_user_meta_data->>'telefone', ''),
    COALESCE(new.raw_user_meta_data->>'responsavel', ''),
    COALESCE(new.raw_user_meta_data->>'status', 'Pendente'),
    COALESCE(new.raw_user_meta_data->>'cep', ''),
    COALESCE(new.raw_user_meta_data->>'logradouro', ''),
    COALESCE(new.raw_user_meta_data->>'numero', ''),
    COALESCE(new.raw_user_meta_data->>'complemento', ''),
    COALESCE(new.raw_user_meta_data->>'bairro', ''),
    COALESCE(new.raw_user_meta_data->>'cidade_estado', new.raw_user_meta_data->>'cidadeEstado', ''),
    COALESCE(new.raw_user_meta_data->>'app_name', 'default'),
    CASE WHEN new.raw_user_meta_data->>'status' = 'Aprovado' THEN now() ELSE NULL END,
    COALESCE(new.raw_user_meta_data->>'plan_type', 'free'),
    CASE WHEN new.raw_user_meta_data->>'plan_start_date' IS NOT NULL THEN (new.raw_user_meta_data->>'plan_start_date')::timestamp with time zone ELSE NULL END,
    CASE WHEN new.raw_user_meta_data->>'plan_end_date' IS NOT NULL THEN (new.raw_user_meta_data->>'plan_end_date')::timestamp with time zone ELSE NULL END,
    COALESCE(new.raw_user_meta_data->>'admin_notes', ''),
    COALESCE((new.raw_user_meta_data->>'is_super_admin')::boolean, false),
    COALESCE(new.raw_user_meta_data->>'access_profile', 'Proprietário')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    company_name = CASE WHEN profiles.company_name IS NULL OR profiles.company_name = '' THEN EXCLUDED.company_name ELSE profiles.company_name END,
    cnpj = CASE WHEN profiles.cnpj IS NULL OR profiles.cnpj = '' THEN EXCLUDED.cnpj ELSE profiles.cnpj END,
    razao_social = CASE WHEN profiles.razao_social IS NULL OR profiles.razao_social = '' THEN EXCLUDED.razao_social ELSE profiles.razao_social END,
    nome_fantasia = CASE WHEN profiles.nome_fantasia IS NULL OR profiles.nome_fantasia = '' THEN EXCLUDED.nome_fantasia ELSE profiles.nome_fantasia END,
    endereco = CASE WHEN profiles.endereco IS NULL OR profiles.endereco = '' THEN EXCLUDED.endereco ELSE profiles.endereco END,
    telefone = CASE WHEN profiles.telefone IS NULL OR profiles.telefone = '' THEN EXCLUDED.telefone ELSE profiles.telefone END,
    responsavel = CASE WHEN profiles.responsavel IS NULL OR profiles.responsavel = '' THEN EXCLUDED.responsavel ELSE profiles.responsavel END,
    cep = CASE WHEN profiles.cep IS NULL OR profiles.cep = '' THEN EXCLUDED.cep ELSE profiles.cep END,
    logradouro = CASE WHEN profiles.logradouro IS NULL OR profiles.logradouro = '' THEN EXCLUDED.logradouro ELSE profiles.logradouro END,
    numero = CASE WHEN profiles.numero IS NULL OR profiles.numero = '' THEN EXCLUDED.numero ELSE profiles.numero END,
    complemento = CASE WHEN profiles.complemento IS NULL OR profiles.complemento = '' THEN EXCLUDED.complemento ELSE profiles.complemento END,
    bairro = CASE WHEN profiles.bairro IS NULL OR profiles.bairro = '' THEN EXCLUDED.bairro ELSE profiles.bairro END,
    cidade_estado = CASE WHEN profiles.cidade_estado IS NULL OR profiles.cidade_estado = '' THEN EXCLUDED.cidade_estado ELSE profiles.cidade_estado END,
    access_profile = COALESCE(profiles.access_profile, EXCLUDED.access_profile, 'Proprietário');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
