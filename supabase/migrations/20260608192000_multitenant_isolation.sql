-- Migration to isolate data by CNPJ (app_name)

DO $DO$
DECLARE
    user_1_id uuid;
    user_2_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO user_1_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br';
    SELECT id INTO user_2_id FROM auth.users WHERE email = 'marcelaourique@yahoo.com.br';

    -- User 1: farmaciaeickhoff@terra.com.br
    IF user_1_id IS NOT NULL THEN
        UPDATE public.profiles SET app_name = '30765609000112' WHERE id = user_1_id;
        
        UPDATE public.transactions 
        SET project_id = '30765609000112' 
        WHERE user_id = user_1_id AND project_id != '30765609000112';
        
        UPDATE public.monthly_metrics m
        SET project_id = '30765609000112' 
        WHERE user_id = user_1_id AND project_id != '30765609000112'
        AND NOT EXISTS (
            SELECT 1 FROM public.monthly_metrics m2 
            WHERE m2.user_id = m.user_id AND m2.year = m.year AND m2.month = m.month AND m2.project_id = '30765609000112'
        );

        UPDATE public.user_settings u
        SET project_id = '30765609000112' 
        WHERE user_id = user_1_id AND project_id != '30765609000112'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_settings u2 
            WHERE u2.user_id = u.user_id AND u2.project_id = '30765609000112'
        );
        
        UPDATE public.appointments 
        SET project_id = '30765609000112' 
        WHERE user_id = user_1_id AND project_id != '30765609000112';

        UPDATE public.audit_logs 
        SET project_id = '30765609000112' 
        WHERE user_id = user_1_id AND project_id != '30765609000112';
    END IF;

    -- User 2: marcelaourique@yahoo.com.br
    IF user_2_id IS NOT NULL THEN
        UPDATE public.profiles SET app_name = '02671419000109' WHERE id = user_2_id;
        
        UPDATE public.transactions 
        SET project_id = '02671419000109' 
        WHERE user_id = user_2_id AND project_id != '02671419000109';
        
        UPDATE public.monthly_metrics m
        SET project_id = '02671419000109' 
        WHERE user_id = user_2_id AND project_id != '02671419000109'
        AND NOT EXISTS (
            SELECT 1 FROM public.monthly_metrics m2 
            WHERE m2.user_id = m.user_id AND m2.year = m.year AND m2.month = m.month AND m2.project_id = '02671419000109'
        );

        UPDATE public.user_settings u
        SET project_id = '02671419000109' 
        WHERE user_id = user_2_id AND project_id != '02671419000109'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_settings u2 
            WHERE u2.user_id = u.user_id AND u2.project_id = '02671419000109'
        );
        
        UPDATE public.appointments 
        SET project_id = '02671419000109' 
        WHERE user_id = user_2_id AND project_id != '02671419000109';

        UPDATE public.audit_logs 
        SET project_id = '02671419000109' 
        WHERE user_id = user_2_id AND project_id != '02671419000109';
    END IF;
END $DO$;

-- RLS Policy Enforcement
-- Ensure all main tables use project_id for tenant isolation

-- Transactions
DROP POLICY IF EXISTS "Users can manage transactions" ON public.transactions;
CREATE POLICY "Users can manage transactions" ON public.transactions
    FOR ALL TO authenticated
    USING (project_id = get_user_app_name())
    WITH CHECK (project_id = get_user_app_name());

-- Monthly Metrics
DROP POLICY IF EXISTS "Users can manage monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Users can manage monthly metrics" ON public.monthly_metrics
    FOR ALL TO authenticated
    USING (project_id = get_user_app_name())
    WITH CHECK (project_id = get_user_app_name());

-- User Settings
DROP POLICY IF EXISTS "Users can manage user settings" ON public.user_settings;
CREATE POLICY "Users can manage user settings" ON public.user_settings
    FOR ALL TO authenticated
    USING (project_id = get_user_app_name())
    WITH CHECK (project_id = get_user_app_name());

-- Appointments
DROP POLICY IF EXISTS "Users can manage appointments" ON public.appointments;
CREATE POLICY "Users can manage appointments" ON public.appointments
    FOR ALL TO authenticated
    USING (project_id = get_user_app_name())
    WITH CHECK (project_id = get_user_app_name());

-- Audit Logs
DROP POLICY IF EXISTS "Users can manage audit logs" ON public.audit_logs;
CREATE POLICY "Users can manage audit logs" ON public.audit_logs
    FOR ALL TO authenticated
    USING (project_id = get_user_app_name())
    WITH CHECK (project_id = get_user_app_name());
