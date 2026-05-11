DO $$
DECLARE
  log_record RECORD;
BEGIN
  FOR log_record IN
    SELECT * FROM public.audit_logs 
    WHERE entity = 'Transação' 
    AND action = 'ATUALIZAR'
  LOOP
    -- Verifica se era uma despesa realizada e foi alterada para Retirada/Cortesia indevidamente
    IF (log_record.details->'original'->>'type' IN ('EXPENSE', 'despesa') AND log_record.details->'original'->>'status' = 'REALIZADO') AND
       (log_record.details->'updated'->>'type' IN ('PARTNER_WITHDRAWAL', 'retirada_socios', 'CORTESIA', 'cortesia')) THEN
        
        UPDATE public.transactions 
        SET type = 'despesa',
            status = 'REALIZADO'
        WHERE id = (log_record.entity_id)::uuid;
        
        -- Inserir log de reversao automatico
        INSERT INTO public.audit_logs (user_id, project_id, action, entity, entity_id, details)
        VALUES (
          log_record.user_id, 
          log_record.project_id, 
          'REVERTER', 
          'Transação', 
          log_record.entity_id, 
          jsonb_build_object('reverted_from_log_id', log_record.id, 'reason', 'Correcao automatica de divergencia via analise de banco')
        );
        
    END IF;
  END LOOP;
END $$;
