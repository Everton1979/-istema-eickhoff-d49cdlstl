-- Migration: fix_user_visibility_and_super_admin
-- Description: Sets up super admin functionality, creates/updates marcelaourique profile, and updates RLS for profiles

DO $block$
DECLARE
  marcela_id uuid;
BEGIN
  -- 1. Update existing owners to be super_admin
  UPDATE public.profiles
  SET is_super_admin = true
  WHERE email IN ('farmaciaeickhoff@terra.com.br', 'evertoneickhoff@terra.com.br');

  -- 2. Ensure marcelaourique@yahoo.com.br user exists in auth.users and profiles
  SELECT id INTO marcela_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br' LIMIT 1;
  
  IF marcela_id IS NULL THEN
    marcela_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      marcela_id,
      '00000000-0000-0000-0000-000000000000',
      'marcelaourique@yahoo.com.br',
      crypt('Marcela@2026', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Marcela Ourique"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.profiles (
    id, email, role, status, app_name, razao_social, responsavel
  ) VALUES (
    marcela_id, 'marcelaourique@yahoo.com.br', 'Administrador', 'Ativo', 'marcelaourique_app', 'Marcela Ourique', 'Marcela'
  ) ON CONFLICT (id) DO UPDATE SET 
    role = 'Administrador', 
    app_name = 'marcelaourique_app';

END $block$;

-- 3. Create is_super_admin function if not exists
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $func$
  SELECT COALESCE(is_super_admin, false) FROM public.profiles WHERE id = auth.uid();
$func$;

-- 4. Update RLS policies for profiles to allow super admins to see and manage all profiles
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
  )
  WITH CHECK (
    id = auth.uid()
    OR (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;
CREATE POLICY "Users can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid()
    OR (get_user_role() IN ('Administrador', 'Master') AND app_name = get_user_app_name())
    OR public.is_super_admin()
  );
