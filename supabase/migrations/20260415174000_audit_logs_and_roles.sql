-- Change default role 'Visitante' to 'Usuário' for existing users
DO $$
BEGIN
  UPDATE public.profiles
  SET role = 'Usuário'
  WHERE role = 'Visitante';
END $$;

-- Update the handle_new_user trigger function to use 'Usuário'
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, email, role, status, cnpj, razao_social, nome_fantasia, 
    endereco, telefone, responsavel, cep, logradouro, numero, complemento, bairro, cidade_estado
  )
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'farmaciaeickhoff@terra.com.br' THEN 'Administrador' ELSE 'Usuário' END,
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
$function$;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to be idempotent
DROP POLICY IF EXISTS "Admins can read all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can read own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;

-- Policies
CREATE POLICY "Admins can read all audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (((auth.jwt() ->> 'email'::text) = 'farmaciaeickhoff@terra.com.br'::text) OR (get_user_role() = 'Administrador'::text));

CREATE POLICY "Users can read own audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
