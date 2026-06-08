DO $$
BEGIN
  -- 1. Profiles Migration
  -- Update app_name to the correct CNPJ where it was the old identifier
  -- or associated with the main admin account.
  UPDATE public.profiles 
  SET app_name = '30765609000112' 
  WHERE app_name = 'farmacia_eickhoff' 
     OR email = 'farmaciaeickhoff@terra.com.br';

  -- 2. Transactions Migration
  UPDATE public.transactions 
  SET project_id = '30765609000112' 
  WHERE project_id = 'farmacia_eickhoff';

  -- 3. Appointments Migration
  UPDATE public.appointments 
  SET project_id = '30765609000112' 
  WHERE project_id = 'farmacia_eickhoff';

  -- 4. Audit Logs Migration
  UPDATE public.audit_logs 
  SET project_id = '30765609000112' 
  WHERE project_id = 'farmacia_eickhoff';

  -- 5. Users Migration
  UPDATE public.users 
  SET project_id = '30765609000112' 
  WHERE project_id = 'farmacia_eickhoff';

  -- 6. User Settings Migration (handle composite PK conflicts safely)
  UPDATE public.user_settings us1
  SET project_id = '30765609000112'
  WHERE project_id = 'farmacia_eickhoff'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_settings us2 
      WHERE us2.user_id = us1.user_id 
        AND us2.project_id = '30765609000112'
    );
  
  -- Clean up any remaining records that would conflict
  DELETE FROM public.user_settings WHERE project_id = 'farmacia_eickhoff';

  -- 7. Monthly Metrics Migration (handle unique index conflicts safely)
  UPDATE public.monthly_metrics mm1
  SET project_id = '30765609000112'
  WHERE project_id = 'farmacia_eickhoff'
    AND NOT EXISTS (
      SELECT 1 FROM public.monthly_metrics mm2
      WHERE mm2.project_id = '30765609000112'
        AND mm2.year = mm1.year
        AND mm2.month = mm1.month
    );

  -- Clean up any remaining records that would conflict
  DELETE FROM public.monthly_metrics WHERE project_id = 'farmacia_eickhoff';

END $$;

-- Also update the table default values to match the new CNPJ project identifier
ALTER TABLE public.appointments ALTER COLUMN project_id SET DEFAULT '30765609000112'::text;
ALTER TABLE public.audit_logs ALTER COLUMN project_id SET DEFAULT '30765609000112'::text;
ALTER TABLE public.monthly_metrics ALTER COLUMN project_id SET DEFAULT '30765609000112'::text;
ALTER TABLE public.profiles ALTER COLUMN app_name SET DEFAULT '30765609000112'::text;
ALTER TABLE public.transactions ALTER COLUMN project_id SET DEFAULT '30765609000112'::text;
ALTER TABLE public.user_settings ALTER COLUMN project_id SET DEFAULT '30765609000112'::text;
