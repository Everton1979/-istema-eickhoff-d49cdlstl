-- 1. Add new columns
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS initial_balance_sicredi NUMERIC DEFAULT 0;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- 2. Data Migration: Consolidate old accounts to payment_method and single sicredi account
DO $do$
BEGIN
  -- Move the old 'account' to 'payment_method' for incomes, converting to the new concept.
  UPDATE public.transactions 
  SET payment_method = account 
  WHERE type = 'receita' AND payment_method IS NULL;

  -- Ensure all transactions (in and out) map directly to the unified 'sicredi' account
  UPDATE public.transactions 
  SET account = 'sicredi';

  -- Consolidate the initial balances into the single sicredi balance
  -- We only do this if it's currently 0 to make it idempotent
  UPDATE public.user_settings
  SET initial_balance_sicredi = 
    COALESCE(initial_balance_dinheiro, 0) + 
    COALESCE(initial_balance_stone, 0) + 
    COALESCE(initial_balance_pagbank, 0) + 
    COALESCE(initial_balance_pix, 0) + 
    COALESCE(initial_balance_banricompras, 0)
  WHERE initial_balance_sicredi IS NULL OR initial_balance_sicredi = 0;
END $do$;
