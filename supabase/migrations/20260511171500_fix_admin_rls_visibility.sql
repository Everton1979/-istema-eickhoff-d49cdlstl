-- Drop existing policies
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;

-- Allow Admin to see ALL profiles unconditionally
CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (id = auth.uid()) 
    OR 
    (get_user_role() = 'Administrador'::text)
  );

-- Allow Admin to update ALL profiles unconditionally
CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    (id = auth.uid()) 
    OR 
    (get_user_role() = 'Administrador'::text)
  )
  WITH CHECK (
    (id = auth.uid()) 
    OR 
    (get_user_role() = 'Administrador'::text)
  );
