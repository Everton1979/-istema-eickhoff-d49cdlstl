DO $$
DECLARE
  v_current_total numeric;
  v_difference numeric;
  v_target numeric := 97400.07;
  v_user_id uuid;
BEGIN
  -- Identificar o ID do usuário administrador principal do projeto
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Limpar possíveis ajustes anteriores gerados por este mesmo script para garantir idempotência
    DELETE FROM public.transactions 
    WHERE user_id = v_user_id 
      AND project_id = 'farmacia' 
      AND description = 'Ajuste de Auditoria - Março 2026'
      AND date >= '2026-03-01'::date AND date < '2026-04-01'::date;
  
    -- Calcular o total atual de despesas realizadas em março de 2026
    SELECT COALESCE(SUM(amount), 0) INTO v_current_total
    FROM public.transactions
    WHERE user_id = v_user_id
      AND project_id = 'farmacia'
      AND type = 'despesa'
      AND status = 'REALIZADO'
      AND date >= '2026-03-01'::date AND date < '2026-04-01'::date;
      
    v_difference := v_target - v_current_total;
    
    -- Inserir a transação de ajuste para corrigir a divergência
    IF v_difference <> 0 THEN
      INSERT INTO public.transactions (
        user_id,
        project_id,
        description,
        amount,
        type,
        category,
        account,
        status,
        date,
        tags
      ) VALUES (
        v_user_id,
        'farmacia',
        'Ajuste de Auditoria - Março 2026',
        v_difference,
        'despesa',
        'variável',
        'sicredi',
        'REALIZADO',
        '2026-03-31T12:00:00Z',
        'ajuste_auditoria'
      );
    END IF;
  END IF;
END $$;
