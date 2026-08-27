-- Migration: create user_categories and user_payment_methods tables
-- Requirements:
-- user_categories: id (uuid PK), user_id (uuid FK -> auth.users), project_id (text), name (text), type (text: 'fixed' | 'variable'), created_at (timestamptz)
-- user_payment_methods: id (uuid PK), user_id (uuid FK -> auth.users), project_id (text), name (text), created_at (timestamptz)
-- RLS: each user sees/inserts only their own records + super admin sees everything

CREATE TABLE IF NOT EXISTS public.user_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_categories_user_project ON public.user_categories(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_project ON public.user_payment_methods(user_id, project_id);

-- Enable RLS
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies for user_categories
DROP POLICY IF EXISTS "user_categories_select" ON public.user_categories;
CREATE POLICY "user_categories_select" ON public.user_categories
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_categories_insert" ON public.user_categories;
CREATE POLICY "user_categories_insert" ON public.user_categories
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_categories_update" ON public.user_categories;
CREATE POLICY "user_categories_update" ON public.user_categories
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_categories_delete" ON public.user_categories;
CREATE POLICY "user_categories_delete" ON public.user_categories
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- Policies for user_payment_methods
DROP POLICY IF EXISTS "user_payment_methods_select" ON public.user_payment_methods;
CREATE POLICY "user_payment_methods_select" ON public.user_payment_methods
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_payment_methods_insert" ON public.user_payment_methods;
CREATE POLICY "user_payment_methods_insert" ON public.user_payment_methods
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_payment_methods_update" ON public.user_payment_methods;
CREATE POLICY "user_payment_methods_update" ON public.user_payment_methods
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "user_payment_methods_delete" ON public.user_payment_methods;
CREATE POLICY "user_payment_methods_delete" ON public.user_payment_methods
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());
