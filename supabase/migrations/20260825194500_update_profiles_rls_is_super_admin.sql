-- Migration to update profiles RLS policies using is_super_admin() instead of fixed email
-- Idempotent replacement of SELECT, INSERT, UPDATE, DELETE policies on public.profiles

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_super_admin())
  WITH CHECK (id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_super_admin());
