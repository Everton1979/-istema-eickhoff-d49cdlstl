-- 1. Add new columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS logradouro TEXT,
ADD COLUMN IF NOT EXISTS numero TEXT,
ADD COLUMN IF NOT EXISTS complemento TEXT,
ADD COLUMN IF NOT EXISTS bairro TEXT,
ADD COLUMN IF NOT EXISTS cidade_estado TEXT;

-- 2. Update roles to enforce only farmaciaeickhoff@terra.com.br is Administrador
UPDATE public.profiles
SET role = 'Administrador', status = 'Ativo'
WHERE email = 'farmaciaeickhoff@terra.com.br';

UPDATE public.profiles
SET role = 'Visitante'
WHERE email != 'farmaciaeickhoff@terra.com.br' AND role = 'Administrador';

-- 3. Update the trigger to populate new fields and enforce admin role securely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, role, status, cnpj, razao_social, nome_fantasia, 
    endereco, telefone, responsavel, cep, logradouro, numero, complemento, bairro, cidade_estado
  )
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'farmaciaeickhoff@terra.com.br' THEN 'Administrador' ELSE 'Visitante' END,
    CASE WHEN NEW.email = 'farmaciaeickhoff@terra.com.br' THEN 'Ativo' ELSE 'Pendente' END,
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
    NEW.raw_user_meta_data->>'cidade_estado'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Replace RLS Policies on profiles to ensure only the specific email can read/update all
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'farmaciaeickhoff@terra.com.br'
  );

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'farmaciaeickhoff@terra.com.br'
  );

-- 5. Seed the admin user if it doesn't exist yet
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Farmácia"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;
