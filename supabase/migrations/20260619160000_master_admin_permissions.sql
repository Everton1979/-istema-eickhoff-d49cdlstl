DO $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin', is_super_admin = true
  WHERE email = 'farmaciaeickhoff@terra.com.br';
END $$;
