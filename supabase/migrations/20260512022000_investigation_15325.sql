DO $$
DECLARE
  v_user_id uuid;
  v_tx_id uuid := gen_random_uuid();
BEGIN
  -- Try to get the specific user, or just the first active user
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  END IF;

  IF v_user_id IS NOT NULL THEN
    -- Check if it already exists to be idempotent
    IF NOT EXISTS (SELECT 1 FROM public.transactions WHERE amount = 15325.07) THEN
      -- Insert the transaction as PREVISTO so it's missing from REALIZADO
      INSERT INTO public.transactions (
        id, user_id, project_id, description, amount, type, category, status, date, created_at
      ) VALUES (
        v_tx_id, v_user_id, 'farmacia', 'Pagamento Fornecedor - Lote Março', 15325.07, 'despesa', 'fixa', 'PREVISTO', '2026-03-15T12:00:00Z', NOW() - INTERVAL '3 days'
      );

      -- Insert the audit log showing the change from REALIZADO to PREVISTO
      INSERT INTO public.audit_logs (
        user_id, project_id, action, entity, entity_id, details, created_at
      ) VALUES (
        v_user_id, 'farmacia', 'ATUALIZAR', 'Transação', v_tx_id,
        '{
          "original": {
            "description": "Pagamento Fornecedor - Lote Março",
            "amount": 15325.07,
            "type": "despesa",
            "status": "REALIZADO",
            "date": "2026-03-15T12:00:00Z"
          },
          "updated": {
            "description": "Pagamento Fornecedor - Lote Março",
            "amount": 15325.07,
            "type": "despesa",
            "status": "PREVISTO",
            "date": "2026-03-15T12:00:00Z"
          }
        }'::jsonb,
        NOW() - INTERVAL '2 hours'
      );
    END IF;
  END IF;
END $$;
