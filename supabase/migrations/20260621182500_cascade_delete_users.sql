DO $BODY$
DECLARE
    r RECORD;
BEGIN
    -- For profiles
    FOR r IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'profiles' AND kcu.column_name = 'id'
    LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- For appointments
    FOR r IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'appointments' AND kcu.column_name = 'user_id'
    LOOP
        EXECUTE 'ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    ALTER TABLE public.appointments ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- For audit_logs
    FOR r IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'audit_logs' AND kcu.column_name = 'user_id'
    LOOP
        EXECUTE 'ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- For monthly_metrics
    FOR r IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'monthly_metrics' AND kcu.column_name = 'user_id'
    LOOP
        EXECUTE 'ALTER TABLE public.monthly_metrics DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    ALTER TABLE public.monthly_metrics ADD CONSTRAINT monthly_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- For transactions
    FOR r IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'transactions' AND kcu.column_name = 'user_id'
    LOOP
        EXECUTE 'ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- For user_settings
    FOR r IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'user_settings' AND kcu.column_name = 'user_id'
    LOOP
        EXECUTE 'ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- For users
    FOR r IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'users' AND kcu.column_name = 'user_id'
    LOOP
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    ALTER TABLE public.users ADD CONSTRAINT users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

END $BODY$;
