-- Migração para dar suporte à categoria de "Equipamentos e Investimentos"
-- A coluna "category" é do tipo texto sem restrições (CHECK constraint),
-- portanto, não é necessária alteração de esquema estrutural.

DO $$
BEGIN
  -- Este bloco garante que a migração execute com sucesso caso precise ser referenciada pelo histórico.
  -- Nenhuma alteração DDL é estritamente necessária, pois a estrutura atual já suporta strings de texto livre.
END $$;
