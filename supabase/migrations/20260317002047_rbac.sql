-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Visitante' CHECK (role IN ('Administrador', 'Colaborador', 'Visitante')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate existing users into profiles (make admin@example.com Administrador, others Visitante)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 
  CASE WHEN email = 'admin@example.com' THEN 'Administrador' ELSE 'Visitante' END
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Trigger to automatically create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'Visitante');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure helper function to get user role (bypasses RLS internally for performance/avoiding recursion)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.get_user_role() = 'Administrador');

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.get_user_role() = 'Administrador');

-- Update transactions RLS for RBAC
DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
CREATE POLICY "Authenticated users can read transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and Colaborador can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('Administrador', 'Colaborador'));
CREATE POLICY "Admin and Colaborador can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (public.get_user_role() IN ('Administrador', 'Colaborador'));
CREATE POLICY "Admin can delete transactions" ON public.transactions FOR DELETE TO authenticated USING (public.get_user_role() = 'Administrador');

-- Update monthly_metrics RLS for RBAC
DROP POLICY IF EXISTS "Users can manage their own monthly metrics" ON public.monthly_metrics;
CREATE POLICY "Authenticated users can read monthly metrics" ON public.monthly_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and Colaborador can insert monthly metrics" ON public.monthly_metrics FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('Administrador', 'Colaborador'));
CREATE POLICY "Admin and Colaborador can update monthly metrics" ON public.monthly_metrics FOR UPDATE TO authenticated USING (public.get_user_role() IN ('Administrador', 'Colaborador'));
CREATE POLICY "Admin can delete monthly metrics" ON public.monthly_metrics FOR DELETE TO authenticated USING (public.get_user_role() = 'Administrador');

-- Update user_settings RLS for RBAC
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Authenticated users can read user settings" ON public.user_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert user settings" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'Administrador');
CREATE POLICY "Admin can update user settings" ON public.user_settings FOR UPDATE TO authenticated USING (public.get_user_role() = 'Administrador');
CREATE POLICY "Admin can delete user settings" ON public.user_settings FOR DELETE TO authenticated USING (public.get_user_role() = 'Administrador');
