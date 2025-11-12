import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

class AgenteRAGSimples {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async _inferirIntencaoPergunta(pergunta) {
    if (!this.ai) {
      return { operacao: 'SUM_APAGAR', filtros: {} };
    }

    const prompt = `Você é um assistente que converte uma pergunta financeira em uma intenção estruturada.
Retorne UM JSON compacto com os campos:
{
  operacao: string, // ex: SUM_APAGAR, SUM_PAGAS, LISTAR_MOVIMENTOS
  filtros: { periodo?: { inicio?: string, fim?: string }, empresa?: string, tipo?: string }
}

Regras:
- Para perguntas como "total de despesas a pagar", use operacao = SUM_APAGAR.
- Se houver período, preencha filtros.periodo.
- Não inclua qualquer texto fora do JSON.

Pergunta: "${pergunta}"`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [prompt],
      });
      const raw = response.text.trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(raw);
      return parsed;
    } catch {
      // fallback simples
      if (/total.*(a pagar|pendente)/i.test(pergunta)) {
        return { operacao: 'SUM_APAGAR', filtros: {} };
      }
      return { operacao: 'LISTAR_MOVIMENTOS', filtros: {} };
    }
  }

  async consultar(pergunta) {
    const intento = await this._inferirIntencaoPergunta(pergunta);

    switch (intento.operacao) {
      case 'SUM_APAGAR': {
        const result = await prisma.movimentoContas.aggregate({
          _sum: { valortotal: true },
          where: { tipo: 'APAGAR', status: 'PENDENTE' },
        });
        const total = result._sum.valortotal ?? 0;

        const fatos = [{
          descricao: 'Soma de valortotal onde tipo = APAGAR e status = PENDENTE',
          valor: total,
        }];

        const resposta = await this._gerarRespostaLLM(pergunta, fatos);
        return { resposta, fatos };
      }
      case 'LISTAR_MOVIMENTOS': {
        const movimentos = await prisma.movimentoContas.findMany({
          take: 5,
          orderBy: { dataemissao: 'desc' },
          select: {
            idMovimentoContas: true,
            numeronotafiscal: true,
            descricao: true,
            valortotal: true,
            dataemissao: true,
          },
        });
        const fatos = movimentos.map(m => ({
          id: m.idMovimentoContas,
          nota: m.numeronotafiscal,
          descricao: m.descricao,
          valor: m.valortotal,
          data: m.dataemissao,
        }));
        const resposta = await this._gerarRespostaLLM(pergunta, fatos);
        return { resposta, fatos };
      }
      default: {
        const movimentos = await prisma.movimentoContas.findMany({ take: 3 });
        const fatos = movimentos.map(m => ({ descricao: m.descricao, valor: m.valortotal }));
        const resposta = await this._gerarRespostaLLM(pergunta, fatos);
        return { resposta, fatos };
      }
    }
  }

  async _gerarRespostaLLM(pergunta, fatos) {
    if (!this.ai) {
      return `Sem LLM configurado. Fatos: ${JSON.stringify(fatos)}`;
    }
    const prompt = `Você receberá uma pergunta do usuário e uma lista de fatos estruturados do banco.
Responda de forma clara e cite os fatos utilizados (com valores ou notas), sem inventar.

Pergunta: ${pergunta}
Fatos: ${JSON.stringify(fatos)}
`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [prompt],
      });
      return response.text;
    } catch (e) {
      return `Falha ao gerar resposta: ${e?.message || e}`;
    }
  }
}

export default AgenteRAGSimples;