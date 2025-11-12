-- Habilita extensão pgvector e prepara coluna/índice para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Coluna de embeddings para descrição de MovimentoContas (dimensão 768 para compatibilidade ivfflat)
ALTER TABLE "MovimentoContas" ADD COLUMN IF NOT EXISTS descricao_embedding vector(768);

-- Índice de similaridade (cosine) para acelerar busca semântica
CREATE INDEX IF NOT EXISTS movimento_descr_embedding_idx
  ON "MovimentoContas" USING ivfflat (descricao_embedding vector_cosine_ops)
  WITH (lists = 100);