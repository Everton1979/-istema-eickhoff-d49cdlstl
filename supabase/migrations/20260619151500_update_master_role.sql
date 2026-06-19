DO $$
BEGIN
  UPDATE public.profiles 
  SET role = 'Master' 
  WHERE email = 'farmaciaeickhoff@terra.com.br';
END $$;
