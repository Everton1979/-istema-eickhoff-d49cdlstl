DO $$
BEGIN
  -- Atualiza descrições existentes para maiúsculas
  UPDATE public.transactions
  SET description = UPPER(description)
  WHERE description IS NOT NULL AND description != UPPER(description);
END $$;
