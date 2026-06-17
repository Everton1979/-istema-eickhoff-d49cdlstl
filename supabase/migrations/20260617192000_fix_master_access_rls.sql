DO $block$
DECLARE
  master_id uuid;
BEGIN
  -- 1. Ensure farmaciaeickhoff@terra.com.br exists in auth.users
  SELECT id INTO master_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  
  IF master_id IS NULL THEN
    master_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      master_id,
      '00000000-0000-0000-0000-000000000000',
      'farmaciaeickhoff@terra.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Master Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- 2. Update or Insert profile for farmaciaeickhoff@terra.com.br
  INSERT INTO public.profiles (
    id, email, role, status, app_name, razao_social, responsavel, is_super_admin
  ) VALUES (
    master_id, 'farmaciaeickhoff@terra.com.br', 'Master', 'Ativo', 'farmaciaeickhoff_app', 'Farmácia Eickhoff', 'Administrador', true
  ) ON CONFLICT (id) DO UPDATE SET 
    role = 'Master', 
    status = 'Ativo',
    is_super_admin = true,
    app_name = COALESCE(NULLIF(profiles.app_name, ''), 'farmaciaeickhoff_app');
    
END $block$;

-- 3. Replace Helper Functions to be robust and performant (SECURITY DEFINER ensures no RLS recursion)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $func$
  SELECT COALESCE(is_super_admin, false) FROM public.profiles WHERE id = auth.uid();
$func$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $func$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$func$;

CREATE OR REPLACE FUNCTION public.get_user_app_name()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $func$
  SELECT COALESCE(NULLIF(app_name, ''), id::text) FROM public.profiles WHERE id = auth.uid();
$func$;

-- 4. Update RLS policies for profiles to avoid recursion and allow Master full view
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.is_super_admin()
    OR public.get_user_role() = 'Master'
    OR (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  );

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR public.is_super_admin()
    OR public.get_user_role() = 'Master'
    OR (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  )
  WITH CHECK (
    id = auth.uid()
    OR public.is_super_admin()
    OR public.get_user_role() = 'Master'
    OR (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  );

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid()
    OR public.is_super_admin()
    OR public.get_user_role() = 'Master'
    OR (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  );

DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;
CREATE POLICY "Users can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    public.is_super_admin()
    OR public.get_user_role() = 'Master'
    OR (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  );
