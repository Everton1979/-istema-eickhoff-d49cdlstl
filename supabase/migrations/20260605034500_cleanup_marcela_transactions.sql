DO $$
DECLARE
  deleted_count integer;
BEGIN
  -- 1. Explicitly set app_name = 'farmacia_eickhoff' for profiles
  UPDATE public.profiles
  SET app_name = 'farmacia_eickhoff',
      role = 'Administrador',
      status = 'Ativo'
  WHERE email = 'farmaciaeickhoff@terra.com.br';

  UPDATE public.profiles
  SET app_name = 'farmacia_eickhoff'
  WHERE app_name IS NULL OR app_name = '';

  -- 2. Clean up Marcela's transactions
  WITH deleted AS (
    DELETE FROM public.transactions
    WHERE project_id = 'farmacia_eickhoff'
      AND EXTRACT(YEAR FROM date) = 2026
      AND EXTRACT(MONTH FROM date) IN (4, 5)
      AND user_id IN (
        SELECT id FROM auth.users WHERE email ILIKE '%marcela%'
      )
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  IF deleted_count > 0 THEN
    INSERT INTO public.audit_logs (
      user_id,
      project_id,
      action,
      entity,
      details
    )
    SELECT
      id,
      'farmacia_eickhoff',
      'CLEANUP_EXCLUIR',
      'Transações Marcela (Abr/Mai 2026)',
      jsonb_build_object('deleted_count', deleted_count)
    FROM auth.users
    WHERE email = 'farmaciaeickhoff@terra.com.br'
    LIMIT 1;
  END IF;

END $$;

-- Re-create the function to be absolutely sure
CREATE OR REPLACE FUNCTION public.get_user_app_name()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT app_name FROM profiles WHERE id = auth.uid()), 'farmacia_eickhoff');
$;

-- Update the RLS policy for transactions
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
CREATE POLICY "Users can manage transactions" ON public.transactions
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());

-- Update the RLS policy for profiles
DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;
CREATE POLICY "Users can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING ((public.get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = public.get_user_app_name()));

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((id = auth.uid()) OR ((public.get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = public.get_user_app_name())));

DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING ((id = auth.uid()) OR ((public.get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = public.get_user_app_name())));

DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((id = auth.uid()) OR ((public.get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = public.get_user_app_name())))
  WITH CHECK ((id = auth.uid()) OR ((public.get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = public.get_user_app_name())));

-- Make sure audit logs and monthly metrics are also properly isolated
DROP POLICY IF EXISTS "Users can manage audit logs" ON public.audit_logs;
CREATE POLICY "Users can manage audit logs" ON public.audit_logs
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Users can manage monthly metrics" ON public.monthly_metrics
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());

DROP POLICY IF EXISTS "Users can manage user settings" ON public.user_settings;
CREATE POLICY "Users can manage user settings" ON public.user_settings
  FOR ALL TO authenticated
  USING (project_id = public.get_user_app_name())
  WITH CHECK (project_id = public.get_user_app_name());
