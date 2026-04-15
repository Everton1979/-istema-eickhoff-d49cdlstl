DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cnpj TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS razao_social TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nome_fantasia TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS endereco TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS responsavel TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pendente';

  -- Add Admin policies so Admin can read/update all profiles
  DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
  CREATE POLICY "Admins can read all profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Administrador' );

  DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
  CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Administrador' );
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, role, status, cnpj, razao_social, nome_fantasia, endereco, telefone, responsavel
  )
  VALUES (
    NEW.id,
    NEW.email,
    'Visitante',
    'Pendente',
    NEW.raw_user_meta_data->>'cnpj',
    NEW.raw_user_meta_data->>'razao_social',
    NEW.raw_user_meta_data->>'nome_fantasia',
    NEW.raw_user_meta_data->>'endereco',
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'responsavel'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
