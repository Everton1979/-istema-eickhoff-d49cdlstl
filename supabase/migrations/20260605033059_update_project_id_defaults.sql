-- Update default values for project_id and app_name
ALTER TABLE public.appointments ALTER COLUMN project_id SET DEFAULT 'farmacia_eickhoff';
ALTER TABLE public.audit_logs ALTER COLUMN project_id SET DEFAULT 'farmacia_eickhoff';
ALTER TABLE public.monthly_metrics ALTER COLUMN project_id SET DEFAULT 'farmacia_eickhoff';
ALTER TABLE public.profiles ALTER COLUMN app_name SET DEFAULT 'farmacia_eickhoff';
ALTER TABLE public.transactions ALTER COLUMN project_id SET DEFAULT 'farmacia_eickhoff';
ALTER TABLE public.user_settings ALTER COLUMN project_id SET DEFAULT 'farmacia_eickhoff';

-- Update existing records for consistency and visibility restoration
UPDATE public.appointments SET project_id = 'farmacia_eickhoff' WHERE project_id = 'farmacia';
UPDATE public.audit_logs SET project_id = 'farmacia_eickhoff' WHERE project_id = 'farmacia';
UPDATE public.monthly_metrics SET project_id = 'farmacia_eickhoff' WHERE project_id = 'farmacia';
UPDATE public.profiles SET app_name = 'farmacia_eickhoff' WHERE app_name = 'farmacia';
UPDATE public.transactions SET project_id = 'farmacia_eickhoff' WHERE project_id = 'farmacia';

-- user_settings has a composite PK (user_id, project_id), update safely avoiding conflicts
UPDATE public.user_settings 
SET project_id = 'farmacia_eickhoff' 
WHERE project_id = 'farmacia' 
AND NOT EXISTS (
  SELECT 1 FROM public.user_settings us2 
  WHERE us2.user_id = public.user_settings.user_id 
  AND us2.project_id = 'farmacia_eickhoff'
);

-- Recreate the get_user_app_name function to ensure proper fallback value
CREATE OR REPLACE FUNCTION public.get_user_app_name()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE((SELECT app_name FROM profiles WHERE id = auth.uid()), 'farmacia_eickhoff');
$function$;
