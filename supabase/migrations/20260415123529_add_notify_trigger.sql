-- Enable pg_net if not already enabled (used for HTTP requests in triggers)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to notify via webhook (Edge Function)
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger AS $function$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  -- Build the JSON payload with new user details
  payload := jsonb_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'razao_social', NEW.razao_social,
    'responsavel', NEW.responsavel,
    'telefone', NEW.telefone
  );

  -- Invoke the Edge Function using pg_net
  -- Errors here will be silently ignored so they don't block user registration
  SELECT
    net.http_post(
      url := 'https://sxdqmcrildogtprkglnr.supabase.co/functions/v1/notify-new-user',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload
    )
  INTO request_id;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_profile_created_notify_admin ON public.profiles;
CREATE TRIGGER on_profile_created_notify_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  -- Avoid triggering for the admin user itself
  WHEN (NEW.email != 'farmaciaeickhoff@terra.com.br')
  EXECUTE FUNCTION public.notify_admin_new_user();
