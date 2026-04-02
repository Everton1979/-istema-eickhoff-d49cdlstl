DO $
BEGIN
  UPDATE public.transactions
  SET category = 'receita_operacional'
  WHERE type = 'receita' AND category IS NULL;
END $;
