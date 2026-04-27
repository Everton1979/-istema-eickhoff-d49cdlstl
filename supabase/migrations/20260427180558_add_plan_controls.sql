DO $$
BEGIN
  -- Add plan control columns to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_start_date TIMESTAMPTZ;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_end_date TIMESTAMPTZ;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;

  -- Clean up incorrect admin user registrations from the system as requested
  DELETE FROM auth.users WHERE email IN ('evertoneickoff@terra.com.br', 'evertoneickchoff@terra.com.br');
END $$;
