DO $$
BEGIN
  -- Corrigir transações com datas inválidas ou muito antigas (antes do ano 2000)
  -- usando a data de criação do registro como um fallback razoável
  UPDATE public.transactions
  SET date = created_at
  WHERE date < '2000-01-01'::timestamp with time zone;
END $$;
