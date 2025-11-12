import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

function toVectorLiteral(vec) {
  return `'[${vec.map(v => Number(v).toFixed(6)).join(', ')}]'::vector`;
}

class AgenteRAGSemantico {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
    this.embeddingModel = 'text-embedding-004';
    this.embeddingDim = 768; // compatível com pgvector
    this.topK = 15;
    this.minSimilarity = 0.45; // equilíbrio: boa precisão sem perder cobertura
  }

  async _garantirInfraVector() {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "MovimentoContas" ADD COLUMN IF NOT EXISTS descricao_embedding vector(${this.embeddingDim});`);
    const indexName = 'movimento_descr_embedding_idx';
    await prisma.$executeRawUnsafe(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = '${indexName}' AND n.nspname = 'public'
      ) THEN
        CREATE INDEX ${indexName} ON "MovimentoContas" USING ivfflat (descricao_embedding vector_cosine_ops) WITH (lists = 100);
      END IF;
    END $$;`);
  }

  async _embedText(text) {
    if (!this.ai) throw new Error('GEMINI_API_KEY ausente ou inválida.');
    const input = (text || '').toString();
    const res = await this.ai.models.embedContent({
      model: this.embeddingModel,
      contents: input,
      config: { outputDimensionality: this.embeddingDim },
    });
    let vec = res?.embeddings?.[0]?.values || res?.embedding?.values || res?.data?.embedding?.values;
    if (!Array.isArray(vec) || vec.length === 0) throw new Error('Falha ao obter embedding.');
    if (vec.length > this.embeddingDim) vec = vec.slice(0, this.embeddingDim);
    if (vec.length < this.embeddingDim) throw new Error(`Dimensão insuficiente: ${vec.length}`);
    return vec;
  }

  async _indexarEmbeddings(limit = 300) {
    const faltantes = await prisma.$queryRawUnsafe(
      `SELECT "idMovimentoContas", "descricao" FROM "MovimentoContas" WHERE descricao_embedding IS NULL LIMIT ${limit};`
    );
    if (!faltantes || faltantes.length === 0) return 0;
    for (const row of faltantes) {
      const vec = await this._embedText(row.descricao || '');
      const literal = toVectorLiteral(vec);
      await prisma.$executeRawUnsafe(
        `UPDATE "MovimentoContas" SET descricao_embedding = ${literal} WHERE "idMovimentoContas" = ${row.idMovimentoContas};`
      );
    }
    return faltantes.length;
  }

  async consultar(pergunta) {
    try {
      await this._garantirInfraVector();
    } catch (e) {
      const err = new Error(e?.message || 'Falha ao preparar infra de vetores.');
      err.stage = 'db_prepare_vector';
      throw err;
    }

    try {
      await this._indexarEmbeddings(300);
    } catch (e) {
      const err = new Error(e?.message || 'Falha ao indexar embeddings.');
      err.stage = 'db_index_embeddings';
      throw err;
    }

    let queryVec;
    try {
      queryVec = await this._embedText(pergunta);
    } catch (e) {
      const err = new Error(e?.message || 'Falha ao obter embedding da pergunta.');
      err.stage = 'embed_query';
      throw err;
    }
    const q = toVectorLiteral(queryVec);

    let rows;
    try {
      rows = await prisma.$queryRawUnsafe(
        `SELECT * FROM (
           SELECT "idMovimentoContas", "numeronotafiscal", "descricao", "valortotal", "dataemissao",
                  1 - (descricao_embedding <=> ${q}) AS similarity
           FROM "MovimentoContas"
           WHERE descricao_embedding IS NOT NULL
           ORDER BY descricao_embedding <=> ${q}
           LIMIT ${this.topK}
         ) t
         WHERE similarity >= ${this.minSimilarity}
         ORDER BY similarity DESC
         LIMIT 5;`
      );
    } catch (e) {
      const err = new Error(e?.message || 'Falha na busca semântica.');
      err.stage = 'db_vector_search';
      throw err;
    }

    if (!rows || rows.length === 0) {
      return { resposta: 'Nenhum movimento relevante encontrado para a consulta.', fatos: [] };
    }

    const fatos = rows.map(r => ({
      id: r.idMovimentoContas,
      nota: r.numeronotafiscal,
      descricao: r.descricao,
      valor: r.valortotal,
      data: r.dataemissao,
      similaridade: Number(r.similarity).toFixed(3),
    }));

    const resposta = await this._gerarRespostaLLM(pergunta, fatos);
    return { resposta, fatos };
  }

  async _gerarRespostaLLM(pergunta, fatos) {
    const hasFacts = Array.isArray(fatos) && fatos.length > 0;
    if (!hasFacts) return 'Não há fatos suficientes para responder com contexto.';
    if (!this.ai) return `Sem LLM configurado. Fatos: ${JSON.stringify(fatos)}`;

    const prompt = `Você receberá uma pergunta e uma lista de fatos financeiros (NFs/Movimentos).
Escreva um mini texto (1–2 frases), claro e natural, respondendo à pergunta.
Regras:
- Explique brevemente o porquê da relação (termos/conceitos presentes nas descrições ou contexto semântico).
- Cite até 2 referências inline incluindo id, nota e valor (ex.: id 12, nota 000.084.682, valor 3086,75).
- Seja objetivo, sem metodologia ou repetições.

Pergunta: ${pergunta}
Fatos: ${JSON.stringify(fatos)}
`;
    try {
      const result = await this.ai.models.generateContent({
        contents: [prompt],
        model: 'gemini-2.5-flash',
        config: { maxOutputTokens: 200, temperature: 0.2 },
      });
      let text = '';
      if (result?.response && typeof result.response.text === 'function') {
        text = (result.response.text() || '').trim();
      }
      if (!text) {
        text = ((result?.response?.candidates?.[0]?.content?.parts || [])
          .map(p => (p?.text || '')).join(' ') || '').trim();
      }
      if (text) return text;
      const top = fatos.slice(0,2);
      const refs = top.map(f=>`id ${f.id}, nota ${f.nota}, valor ${f.valor}`).join('; ');
      const base = `Com base nos dados, encontrei ${fatos.length} itens potencialmente relacionados à pergunta.`;
      return refs ? `${base} Referências: ${refs}.` : base;
    } catch (e) {
      const top = fatos.slice(0,2);
      const refs = top.map(f=>`id ${f.id}, nota ${f.nota}, valor ${f.valor}`).join('; ');
      const base = `Com base nos dados, encontrei ${fatos.length} itens potencialmente relacionados à pergunta.`;
      return refs ? `${base} Referências: ${refs}.` : base;
    }
  }
}

export default AgenteRAGSemantico;