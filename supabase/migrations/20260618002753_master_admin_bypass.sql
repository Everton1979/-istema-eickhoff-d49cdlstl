DO $$
BEGIN
  UPDATE public.profiles 
  SET is_super_admin = true, 
      role = 'admin', 
      status = 'approved' 
  WHERE email = 'farmaciaeickhoff@terra.com.br';
END $$;
