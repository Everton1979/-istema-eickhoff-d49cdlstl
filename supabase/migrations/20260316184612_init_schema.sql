-- create tables
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_balance_dinheiro NUMERIC DEFAULT 0,
  initial_balance_stone NUMERIC DEFAULT 0,
  initial_balance_pagbank NUMERIC DEFAULT 0,
  initial_balance_pix NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  account TEXT,
  status TEXT NOT NULL DEFAULT 'REALIZADO',
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

DO $do$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '',
    NULL, '', '', ''
  );

  INSERT INTO public.user_settings (user_id, initial_balance_dinheiro, initial_balance_stone, initial_balance_pagbank, initial_balance_pix)
  VALUES (new_user_id, 15000, 25000, 10000, 50000);

  -- some initial transactions
  INSERT INTO public.transactions (user_id, description, amount, type, category, account, status, date)
  VALUES 
    (new_user_id, 'Venda de Produto', 5000, 'receita', NULL, 'stone', 'REALIZADO', NOW() - INTERVAL '10 days'),
    (new_user_id, 'Mensalidade Software', 1500, 'despesa', 'fixa', NULL, 'REALIZADO', NOW() - INTERVAL '5 days'),
    (new_user_id, 'Consultoria', 3000, 'receita', NULL, 'pix', 'REALIZADO', NOW() - INTERVAL '2 days'),
    (new_user_id, 'Marketing Ad', 800, 'despesa', 'variável', NULL, 'REALIZADO', NOW() - INTERVAL '1 day');
END $do$;
