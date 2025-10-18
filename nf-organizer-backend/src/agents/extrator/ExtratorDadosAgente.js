// src/agents/extrator/ExtratorDadosAgente.js
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import { Buffer } from 'buffer';

dotenv.config();

// Define a estrutura JSON esperada (Schema para o prompt)
const SCHEMA_JSON = {
    fornecedor: {
        razao_social: 'string',
        nome_fantasia: 'string | null',
        cnpj: 'string',
    },
    faturado: {
        nome_completo: 'string',
        cpf: 'string | null',
    },
    numero_nota_fiscal: 'string',
    data_emissao: 'YYYY-MM-DD',
    descricao_produtos: 'string',
    parcelas: [{
        data_vencimento: 'YYYY-MM-DD',
    }, ],
    valor_total: 'float',
    classificacao_despesa: ['string', ],
};

// Define as categorias de despesa
const CATEGORIES = [
    'INSUMOS AGRÍCOLAS', 'MANUTENÇÃO E OPERAÇÃO', 'RECURSOS HUMANOS',
    'SERVIÇOS OPERACIONAIS', 'INFRAESTRUTURA E UTILIDADES', 'ADMINISTRATIVAS',
    'SEGUROS E PROTEÇÃO', 'IMPOSTOS E TAXAS', 'INVESTIMENTOS',
];

class ExtratorDadosAgente {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('ERRO: Variável GEMINI_API_KEY não definida no arquivo .env');
            this.ai = null;
        } else {
            this.ai = new GoogleGenAI({ apiKey });
        }
    }

    _construirPromptEspecializado() {
        const categoriesList = CATEGORIES.join(', ');

        return `
        Você é um assistente de IA especialista em processamento de documentos fiscais. Sua tarefa é analisar o documento de nota fiscal e extrair informações cruciais, retornando-as estritamente no formato JSON definido abaixo.

        **Siga estas regras rigorosamente:**
        1.  **SAÍDA EXCLUSIVA:** Sua resposta deve ser APENAS o objeto JSON.
        2.  **SCHEMA JSON:** A estrutura do JSON de saída deve ser exatamente esta:
        
        \`\`\`json
        ${JSON.stringify(SCHEMA_JSON, null, 2).replace(/"float"/g, 'float')}
        \`\`\`

        **Instruções Detalhadas para cada Campo:**
        - razao_social, cnpj, nome_completo, numero_nota_fiscal, data_emissao, valor_total: Extraia diretamente do documento.
        - nome_fantasia, cpf: Extraia se disponível, preste bastante atenção, o cpf pode estar como CPF/CPNJ ligado ao DESTINATÁRIO/REMETENTE, tome cuidado.
        - descricao_produtos: Concatene a descrição de todos os itens/produtos da nota em uma única string.
        - valor_total: Deve ser um número (float), sem "R$". Ex: 1500.50, Ex: 1243.00, nada de usar vírgulas.
        - parcelas: Deve ser uma lista. Se houver apenas um vencimento, crie uma lista com um único objeto. Se não houver data de vencimento explícita, use a data_emissao.
        - **classificacao_despesa:**
            - Este campo deve ser **INFERIDO** com base na descricao_produtos.
            - Categorias: ${categoriesList}
            - Ex: "Óleo Diesel" -> "MANUTENÇÃO E OPERAÇÃO"; "Notebook" -> "INFRAESTRUTURA E UTILIDADES".
            - Se não se encaixar em nenhuma, use "OUTROS".

        Analise o documento e retorne o JSON preenchido.
        `;
    }

    async processarDocumentoFiscal(fileBuffer) {
        if (!this.ai) {
            return { error: 'A API do Gemini não está configurada corretamente.' };
        }
        
        const pdfPart = {
            inlineData: {
                data: fileBuffer.toString('base64'),
                mimeType: 'application/pdf',
            },
        };

        try {
            const prompt = this._construirPromptEspecializado();

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [pdfPart, prompt],
            });

            const responseText = response.text.trim();
            let jsonString = responseText.replace(/```json|```/g, '').trim();

            return JSON.parse(jsonString);

        } catch (e) {
            console.error('Erro no processamento do Gemini:', e);
            return { error: 'Erro ao processar o documento com a IA.' };
        }
    }
}

export default ExtratorDadosAgente;