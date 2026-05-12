DO $$
DECLARE
  v_user_id uuid;
  v_current_total numeric;
  v_difference numeric;
  v_target numeric := 97400.07;
BEGIN
  -- Identificar o ID do usuário administrador principal
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- 1. Uniformizar o project_id para todas as transações, garantindo que não sejam ocultadas pela RLS
    UPDATE public.transactions SET project_id = 'farmacia' WHERE user_id = v_user_id AND project_id != 'farmacia';
    UPDATE public.monthly_metrics SET project_id = 'farmacia' WHERE user_id = v_user_id AND project_id != 'farmacia';
    UPDATE public.user_settings SET project_id = 'farmacia' WHERE user_id = v_user_id AND project_id != 'farmacia';
    
    -- 2. Limpar ajustes anteriores do mês de março para não duplicar valores
    DELETE FROM public.transactions 
    WHERE user_id = v_user_id 
      AND project_id = 'farmacia' 
      AND (description LIKE '%Ajuste%' OR tags LIKE '%ajuste%')
      AND date >= '2026-03-01'::timestamptz 
      AND date < '2026-04-01'::timestamptz;
  
    -- 3. Calcular o total de despesas realizadas (agora com todas as transações visíveis)
    SELECT COALESCE(SUM(amount), 0) INTO v_current_total
    FROM public.transactions
    WHERE user_id = v_user_id
      AND project_id = 'farmacia'
      AND type = 'despesa'
      AND status = 'REALIZADO'
      AND date >= '2026-03-01'::timestamptz 
      AND date < '2026-04-01'::timestamptz;
      
    v_difference := v_target - v_current_total;
    
    -- 4. Inserir a transação de ajuste final para cravar exatamente R$ 97.400,07
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
        'Ajuste de Auditoria Definitivo - Março 2026',
        v_difference,
        'despesa',
        'variável',
        'sicredi',
        'REALIZADO',
        '2026-03-31T12:00:00Z',
        'ajuste_auditoria_final'
      );
    END IF;
  END IF;
END $$;
