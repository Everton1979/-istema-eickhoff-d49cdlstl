DO $$
BEGIN
  -- Handle user_settings which has (user_id, project_id) composite PK
  -- First, delete duplicate legacy entries if a modern entry already exists
  DELETE FROM public.user_settings
  WHERE project_id = 'farmacia'
  AND user_id IN (
    SELECT user_id FROM public.user_settings WHERE project_id = 'farmacia_eickhoff'
  );

  -- Then update the rest
  UPDATE public.user_settings
  SET project_id = 'farmacia_eickhoff'
  WHERE project_id = 'farmacia';

  -- Handle monthly_metrics which has unique constraint on (user_id, project_id, year, month)
  DELETE FROM public.monthly_metrics
  WHERE project_id = 'farmacia'
  AND (user_id, year, month) IN (
    SELECT user_id, year, month FROM public.monthly_metrics WHERE project_id = 'farmacia_eickhoff'
  );

  UPDATE public.monthly_metrics
  SET project_id = 'farmacia_eickhoff'
  WHERE project_id = 'farmacia';

  -- Update other tables safely
  UPDATE public.transactions
  SET project_id = 'farmacia_eickhoff'
  WHERE project_id = 'farmacia';

  UPDATE public.appointments
  SET project_id = 'farmacia_eickhoff'
  WHERE project_id = 'farmacia';

  UPDATE public.audit_logs
  SET project_id = 'farmacia_eickhoff'
  WHERE project_id = 'farmacia';

  UPDATE public.users
  SET project_id = 'farmacia_eickhoff'
  WHERE project_id = 'farmacia';
END $$;
