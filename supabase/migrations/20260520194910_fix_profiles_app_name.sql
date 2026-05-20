DO $$
BEGIN
  -- 1. Ensure users intended for another app stay there (Isolation)
  UPDATE public.profiles
  SET app_name = 'salaofacil'
  WHERE email = 'lisianezdruikoski@gmail.com';

  -- 2. Correct app_name for specific administrators (Admin Access Restoration)
  UPDATE public.profiles
  SET app_name = 'farmacia'
  WHERE email IN ('farmaciaeickhoff@terra.com.br', 'evertoneickhoff@terra.com.br');

  -- 3. Ensure any other profiles with NULL app_name fall into the default 'farmacia' context (Data Integrity)
  UPDATE public.profiles
  SET app_name = 'farmacia'
  WHERE app_name IS NULL;
  
END $$;
