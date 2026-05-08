-- Drop existing policies
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;

-- Create helper function to get user app_name without recursion
CREATE OR REPLACE FUNCTION public.get_user_app_name()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(app_name, 'farmacia') FROM profiles WHERE id = auth.uid();
$function$;

-- Create new policies restricting access by app_name
CREATE POLICY "Users can read profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR 
  (get_user_role() = 'Administrador'::text AND COALESCE(app_name, 'farmacia') = public.get_user_app_name())
);

CREATE POLICY "Users can update profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (
  id = auth.uid() OR 
  (get_user_role() = 'Administrador'::text AND COALESCE(app_name, 'farmacia') = public.get_user_app_name())
)
WITH CHECK (
  id = auth.uid() OR 
  (get_user_role() = 'Administrador'::text AND COALESCE(app_name, 'farmacia') = public.get_user_app_name())
);
