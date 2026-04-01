ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Atualizar perfis existentes com nomes padrão caso estejam vazios
UPDATE public.profiles 
SET company_name = 'Farmácia Eickhoff' 
WHERE email = 'farmaciaeickhoff@terra.com.br' AND company_name IS NULL;

UPDATE public.profiles 
SET company_name = 'Labovid' 
WHERE email = 'marcelaourique@yahoo.com.br' AND company_name IS NULL;
