-- Ajustar RLS de perfis para garantir isolamento por app_name de forma estrita
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;

CREATE POLICY "Users can read profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  (id = auth.uid()) OR 
  (
    (get_user_role() = 'Administrador'::text) AND 
    (app_name IS NOT NULL) AND
    (app_name = get_user_app_name())
  )
);

-- Atualizar perfil da usuária mencionada para o sistema Salão Fácil, removendo-a da visualização do Eickhoff
UPDATE public.profiles
SET app_name = 'salaofacil'
WHERE email = 'lisianezdruikoski@gmail.com';
