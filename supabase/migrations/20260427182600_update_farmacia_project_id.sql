DO $$
BEGIN
  -- Migra os registros dos usuários que são exclusivamente da farmácia
  UPDATE public.transactions t
  SET project_id = 'farmacia'
  FROM public.profiles p
  WHERE t.user_id = p.id AND p.app_name = 'farmacia' AND t.project_id = 'planilha';

  UPDATE public.monthly_metrics m
  SET project_id = 'farmacia'
  FROM public.profiles p
  WHERE m.user_id = p.id AND p.app_name = 'farmacia' AND m.project_id = 'planilha'
  AND NOT EXISTS (
    SELECT 1 FROM public.monthly_metrics m2 
    WHERE m2.user_id = m.user_id AND m2.month = m.month AND m2.year = m.year AND m2.project_id = 'farmacia'
  );

  UPDATE public.user_settings u
  SET project_id = 'farmacia'
  FROM public.profiles p
  WHERE u.user_id = p.id AND p.app_name = 'farmacia' AND u.project_id = 'planilha'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_settings u2 
    WHERE u2.user_id = u.user_id AND u2.project_id = 'farmacia'
  );

  UPDATE public.audit_logs a
  SET project_id = 'farmacia'
  FROM public.profiles p
  WHERE a.user_id = p.id AND p.app_name = 'farmacia' AND a.project_id = 'planilha';
END $$;
