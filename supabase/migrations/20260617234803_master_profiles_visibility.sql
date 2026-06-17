DO $$
BEGIN
  -- Ensure idempotency by dropping the policy before defining it
  DROP POLICY IF EXISTS "Master user can view all profiles" ON public.profiles;

  -- Create a new policy to grant the Master user unrestricted SELECT access.
  -- This will combine with existing permissive policies using OR, allowing
  -- the Master user to see all profiles, including those with a NULL or empty status.
  CREATE POLICY "Master user can view all profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      auth.jwt() ->> 'email' = 'farmaciaeickhoff@terra.com.br'
    );
END $$;
