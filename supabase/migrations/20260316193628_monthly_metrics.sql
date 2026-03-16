CREATE TABLE public.monthly_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  orders_count INT NOT NULL DEFAULT 0,
  total_system_sales NUMERIC NOT NULL DEFAULT 0,
  raw_material_costs NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE public.monthly_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own monthly metrics" ON public.monthly_metrics FOR ALL USING (auth.uid() = user_id);

DO $do$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1;
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.monthly_metrics (user_id, month, year, orders_count, total_system_sales, raw_material_costs)
    VALUES
      (admin_user_id, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW()), 150, 45000, 12000),
      (admin_user_id, EXTRACT(MONTH FROM NOW() - INTERVAL '1 month'), EXTRACT(YEAR FROM NOW() - INTERVAL '1 month'), 140, 42000, 11000)
    ON CONFLICT (user_id, month, year) DO NOTHING;
  END IF;
END $do$;
