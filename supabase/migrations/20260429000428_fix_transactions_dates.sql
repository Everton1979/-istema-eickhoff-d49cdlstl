DO $$
BEGIN
  -- Corrige datas inválidas (muito antigas ou futuras demais) na tabela transactions
  UPDATE public.transactions
  SET date = created_at
  WHERE date < '2000-01-01'::timestamptz OR date > '2100-01-01'::timestamptz;

  -- Caso existam registros com null (apesar da constraint atual), definimos para created_at
  UPDATE public.transactions
  SET date = created_at
  WHERE date IS NULL;
END $$;
