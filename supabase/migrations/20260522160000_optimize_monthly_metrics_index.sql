-- Ensure the unique index exists for optimal exact-match fetching on monthly_metrics
CREATE UNIQUE INDEX IF NOT EXISTS monthly_metrics_user_id_month_year_project_key 
ON public.monthly_metrics USING btree (user_id, month, year, project_id);

-- Create a supplementary index to optimize the new OR conditions fetching strategy
CREATE INDEX IF NOT EXISTS idx_monthly_metrics_year_month
ON public.monthly_metrics USING btree (year, month);
