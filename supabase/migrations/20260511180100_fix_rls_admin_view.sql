-- Ensure the get_user_role function bypasses RLS correctly to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM profiles WHERE id = auth.uid();
$function$;

DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;

CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated 
  USING (
    id = auth.uid() OR 
    public.get_user_role() = 'Administrador'
  );

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;

CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated 
  USING (
    id = auth.uid() OR 
    public.get_user_role() = 'Administrador'
  )
  WITH CHECK (
    id = auth.uid() OR 
    public.get_user_role() = 'Administrador'
  );
