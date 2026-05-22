CREATE INDEX IF NOT EXISTS idx_transactions_date_status ON public.transactions USING btree (date, status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions USING btree (type);
