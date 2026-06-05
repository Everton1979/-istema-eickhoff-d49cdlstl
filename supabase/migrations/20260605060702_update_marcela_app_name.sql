DO $$
BEGIN
  UPDATE public.profiles 
  SET app_name = 'farmacia_eickhoff' 
  WHERE email = 'marcelaourique@yahoo.com.br' 
    AND (app_name IS DISTINCT FROM 'farmacia_eickhoff');
END $$;
