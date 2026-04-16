DO $$
BEGIN
    -- Profiles table
    DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

    CREATE POLICY "All authenticated users can manage profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Transactions table
    DROP POLICY IF EXISTS "Admins can read all transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;

    CREATE POLICY "All authenticated users can manage transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Monthly Metrics table
    DROP POLICY IF EXISTS "Admins can read all monthly metrics" ON public.monthly_metrics;
    DROP POLICY IF EXISTS "Users can delete own monthly metrics" ON public.monthly_metrics;
    DROP POLICY IF EXISTS "Users can insert own monthly metrics" ON public.monthly_metrics;
    DROP POLICY IF EXISTS "Users can read own monthly metrics" ON public.monthly_metrics;
    DROP POLICY IF EXISTS "Users can update own monthly metrics" ON public.monthly_metrics;

    CREATE POLICY "All authenticated users can manage monthly metrics" ON public.monthly_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Appointments table
    DROP POLICY IF EXISTS "Users can manage own appointments" ON public.appointments;
    CREATE POLICY "All authenticated users can manage appointments" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- User Settings table
    DROP POLICY IF EXISTS "Users can delete own user settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Users can insert own user settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Users can read own user settings" ON public.user_settings;
    DROP POLICY IF EXISTS "Users can update own user settings" ON public.user_settings;

    CREATE POLICY "All authenticated users can manage user settings" ON public.user_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- Audit Logs table
    DROP POLICY IF EXISTS "Admins can read all audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Users can read own audit logs" ON public.audit_logs;

    CREATE POLICY "All authenticated users can manage audit logs" ON public.audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
