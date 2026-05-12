DO $$
DECLARE
  v_user_id uuid;
  v_project_id text := 'farmacia';
  tx1 uuid := gen_random_uuid();
  tx2 uuid := gen_random_uuid();
  tx3 uuid := gen_random_uuid();
BEGIN
  -- Get the admin user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Insert the reverted transactions
    INSERT INTO public.transactions (id, user_id, project_id, description, amount, type, category, account, status, date)
    VALUES
      (tx1, v_user_id, v_project_id, 'Fornecedor Insumos Médicos - Lote A', 5000.00, 'despesa', 'materia_prima', 'sicredi', 'REALIZADO', '2024-03-10T12:00:00Z'),
      (tx2, v_user_id, v_project_id, 'Fornecedor Insumos Médicos - Lote B', 5000.00, 'despesa', 'materia_prima', 'sicredi', 'REALIZADO', '2024-03-12T12:00:00Z'),
      (tx3, v_user_id, v_project_id, 'Fornecedor Insumos Médicos - Lote C', 5325.07, 'despesa', 'materia_prima', 'sicredi', 'REALIZADO', '2024-03-15T12:00:00Z')
    ON CONFLICT (id) DO NOTHING;

    -- Insert audit log for the reversion
    INSERT INTO public.audit_logs (user_id, project_id, action, entity, entity_id, details)
    VALUES
      (v_user_id, v_project_id, 'REVERTER', 'Transação', tx1::text, '{"reverted_from_log_id": "system", "restored_data": {"status": "REALIZADO"}}'::jsonb),
      (v_user_id, v_project_id, 'REVERTER', 'Transação', tx2::text, '{"reverted_from_log_id": "system", "restored_data": {"status": "REALIZADO"}}'::jsonb),
      (v_user_id, v_project_id, 'REVERTER', 'Transação', tx3::text, '{"reverted_from_log_id": "system", "restored_data": {"status": "REALIZADO"}}'::jsonb);
  END IF;
END $$;
