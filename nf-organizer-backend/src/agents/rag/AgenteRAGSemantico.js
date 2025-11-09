import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

function toVectorLiteral(vec) {
  // pgvector accepts literal like '[0.1, 0.2, ...]'
  return `'[${vec.map(v => Number(v).toFixed(6)).join(', ')}]'::vector`;
}

class AgenteRAGSemantico {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
    this.embeddingModel = 'text-embedding-004'; // Gemini embeddings (dim ~3072)
    this.embeddingDim = 768; // Alinha com retorno padrão (compatível ivfflat)
  }

  async _embedText(text) {
    if (!this.ai) throw new Error('GEMINI_API_KEY ausente ou inválida.');
    // Usa o agregador models com a assinatura correta: contents (string)
    const res = await this.ai.models.embedContent({
      model: this.embeddingModel,
      contents: text || '',
      config: { outputDimensionality: this.embeddingDim },
    });
    const vec = res?.embeddings?.[0]?.values;
    if (!vec) throw new Error('Falha ao obter embedding do Gemini.');
    return vec;
  }

  async _garantirColunaEMIndice() {
    // Cria coluna vector e índice IVFFLAT se não existirem
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    // Zera e recria estrutura para garantir dimensionalidade correta
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS movimento_descr_embedding_idx;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "MovimentoContas" DROP COLUMN IF EXISTS descricao_embedding;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "MovimentoContas" ADD COLUMN descricao_embedding vector(${this.embeddingDim});`);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX movimento_descr_embedding_idx ON "MovimentoContas" USING ivfflat (descricao_embedding vector_cosine_ops) WITH (lists = 100);`
    );
  }

  async _indexarEmbeddingsSeNecessario(limit = 50) {
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
      await this._garantirColunaEMIndice();
    } catch (e) {
      const err = new Error(e?.message || 'Falha ao garantir coluna/índice para embeddings.');
      err.stage = 'db_prepare_vector';
      throw err;
    }

    try {
      await this._indexarEmbeddingsSeNecessario(200);
    } catch (e) {
      const err = new Error(e?.message || 'Falha ao indexar embeddings faltantes.');
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

    const queryLiteral = toVectorLiteral(queryVec);

    let resultados;
    try {
      resultados = await prisma.$queryRawUnsafe(
        `SELECT "idMovimentoContas", "numeronotafiscal", "descricao", "valortotal", "dataemissao",
                1 - (descricao_embedding <=> ${queryLiteral}) AS similarity
         FROM "MovimentoContas"
         WHERE descricao_embedding IS NOT NULL
         ORDER BY descricao_embedding <=> ${queryLiteral}
         LIMIT 3;`
      );
    } catch (e) {
      const err = new Error(e?.message || 'Falha na busca semântica no banco.');
      err.stage = 'db_vector_search';
      throw err;
    }

    const fatos = resultados.map(r => ({
      id: r.idMovimentoContas,
      nota: r.numeronotafiscal,
      descricao: r.descricao,
      valor: r.valortotal,
      data: r.dataemissao,
      similaridade: Number(r.similarity).toFixed(3),
    }));

    let resposta;
    try {
      resposta = await this._gerarRespostaLLM(pergunta, fatos);
    } catch (e) {
      const err = new Error(e?.message || 'Falha ao gerar resposta do LLM.');
      err.stage = 'llm_generate';
      throw err;
    }
    return { resposta, fatos };
  }

  async _gerarRespostaLLM(pergunta, fatos) {
    if (!this.ai) {
      return `Sem LLM configurado. Fatos: ${JSON.stringify(fatos)}`;
    }
    const prompt = `Você é conciso e objetivo.
Responda em UMA frase direta. Em seguida, liste até 3 fatos relevantes em bullets (nota e valor). Não explique metodologia. Não repita informações desnecessárias. Se não houver base suficiente, responda: "Não encontrei dados suficientes.".

Pergunta: ${pergunta}
Fatos: ${JSON.stringify(fatos)}
`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [prompt],
        config: { maxOutputTokens: 200, temperature: 0.3 },
      });
      return response.text;
    } catch (e) {
      return `Falha ao gerar resposta: ${e?.message || e}`;
    }
  }
}

export default AgenteRAGSemantico;