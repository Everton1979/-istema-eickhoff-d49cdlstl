-- Fix Lisiane's profile app_name
UPDATE public.profiles
SET app_name = 'salao_facil'
WHERE email = 'lisianezdruikoski@gmail.com';

-- Ensure all other NULL app_names default to 'farmacia'
UPDATE public.profiles
SET app_name = 'farmacia'
WHERE app_name IS NULL;

-- Update RLS policies for profiles to ensure strict isolation by app_name
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  );

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid() OR
    (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  );

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR
    (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  )
  WITH CHECK (
    id = auth.uid() OR
    (public.get_user_role() = 'Administrador' AND app_name = public.get_user_app_name())
  );

-- Fix March 2026 transactions: move PREVISTO to REALIZADO
-- Assuming the difference comes from PREVISTO transactions not counted
UPDATE public.transactions
SET status = 'REALIZADO'
WHERE project_id = 'farmacia'
  AND type = 'despesa'
  AND date >= '2026-03-01' AND date < '2026-04-01'
  AND status != 'REALIZADO';
