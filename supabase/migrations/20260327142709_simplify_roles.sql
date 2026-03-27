DO $$ 
BEGIN
  -- Update all existing users to 'Administrador'
  UPDATE public.profiles SET role = 'Administrador';

  -- Drop old constraint if exists
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  
  -- Add new constraint
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role = 'Administrador');

  -- Update trigger to insert as Administrador
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $func$
  BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'Administrador');
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;
END $$;
