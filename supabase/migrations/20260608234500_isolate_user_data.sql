DO $BODY$
DECLARE
  v_user RECORD;
BEGIN
  -- 1. Specifically force distinct app_names for the two accounts to ensure complete isolation
  FOR v_user IN SELECT id, email FROM auth.users WHERE email IN ('farmaciaeickhoff@terra.com.br', 'marcelaourique@yahoo.com.br') LOOP
    UPDATE public.profiles 
    SET app_name = v_user.id::text 
    WHERE id = v_user.id;
  END LOOP;

  -- 2. Data Segregation Migration: Re-attribute all existing records to the correct owner 
  -- based on their user_id and their profile's current app_name.
  
  -- Update Transactions
  UPDATE public.transactions t
  SET project_id = p.app_name
  FROM public.profiles p
  WHERE t.user_id = p.id 
    AND p.app_name IS NOT NULL 
    AND t.project_id != p.app_name;
  
  -- Update Monthly Metrics
  -- (Handling unique constraints safely by skipping conflicts)
  UPDATE public.monthly_metrics m
  SET project_id = p.app_name
  FROM public.profiles p
  WHERE m.user_id = p.id 
    AND p.app_name IS NOT NULL 
    AND m.project_id != p.app_name
    AND NOT EXISTS (
      SELECT 1 FROM public.monthly_metrics m2
      WHERE m2.project_id = p.app_name 
        AND m2.year = m.year 
        AND m2.month = m.month
    );
    
  -- Update Appointments
  UPDATE public.appointments a
  SET project_id = p.app_name
  FROM public.profiles p
  WHERE a.user_id = p.id 
    AND p.app_name IS NOT NULL 
    AND a.project_id != p.app_name;
  
  -- Update Audit Logs
  UPDATE public.audit_logs al
  SET project_id = p.app_name
  FROM public.profiles p
  WHERE al.user_id = p.id 
    AND p.app_name IS NOT NULL 
    AND al.project_id != p.app_name;
  
  -- Update User Settings
  -- Ensure no duplicate user_settings keys exist if the project_id changes
  UPDATE public.user_settings us
  SET project_id = p.app_name
  FROM public.profiles p
  WHERE us.user_id = p.id 
    AND p.app_name IS NOT NULL 
    AND us.project_id != p.app_name
    AND NOT EXISTS (
      SELECT 1 FROM public.user_settings us2
      WHERE us2.user_id = us.user_id 
        AND us2.project_id = p.app_name
    );
    
  -- Clean up duplicate user_settings that could not be updated due to conflicts
  DELETE FROM public.user_settings us
  USING public.profiles p
  WHERE us.user_id = p.id 
    AND p.app_name IS NOT NULL 
    AND us.project_id != p.app_name;

  -- Update Users table (if exists and has project_id)
  UPDATE public.users u
  SET project_id = p.app_name
  FROM public.profiles p
  WHERE u.user_id = p.id 
    AND p.app_name IS NOT NULL 
    AND u.project_id != p.app_name;

END $BODY$;
