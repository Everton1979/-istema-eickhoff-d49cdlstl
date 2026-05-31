-- Create indexes to optimize the new "Inteligência Analítica" report queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_project_date ON public.transactions USING btree (user_id, project_id, date);
CREATE INDEX IF NOT EXISTS idx_monthly_metrics_user_project_year ON public.monthly_metrics USING btree (user_id, project_id, year);
