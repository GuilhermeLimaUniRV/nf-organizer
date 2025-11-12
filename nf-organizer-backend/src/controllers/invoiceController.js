import ExtratorDadosAgente from '../agents/extrator/ExtratorDadosAgente.js';
import PersistenciaAgente from '../agents/persistencia/PersistenciaAgente.js'; 
import AgenteRAGSimples from '../agents/rag/AgenteRAGSimples.js';
import AgenteRAGSemantico from '../agents/rag/AgenteRAGSemantico.js';
import multer from 'multer';

const agenteExtrator = new ExtratorDadosAgente();
const agentePersistencia = new PersistenciaAgente(); 
const agenteRAGSimples = new AgenteRAGSimples();
const agenteRAGSemantico = new AgenteRAGSemantico();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('pdf_file'); 

export const handleExtraction = [
    upload, 
    async (req, res) => {
        
        if (!req.file || req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Nenhum arquivo PDF válido foi enviado.' });
        }

        try {
            const pdfBuffer = req.file.buffer;
            const dadosIA = await agenteExtrator.processarDocumentoFiscal(pdfBuffer);

            if (dadosIA.error) {
                return res.status(500).json(dadosIA);
            }
            
            return res.status(200).json(dadosIA);

        } catch (e) {
            console.error('Erro de Processamento da IA:', e);
            return res.status(500).json({ error: 'Falha durante o processamento da IA.' });
        }
    }
];

export const handleVerification = async (req, res) => {
    const dadosIA = req.body.dados; 
    
    if (!dadosIA || !dadosIA.fornecedor || !dadosIA.faturado) {
        return res.status(400).json({ error: 'Dados da Nota Fiscal incompletos para verificação.' });
    }

    try {
        const resultadosVerificacao = {
            fornecedor: await agentePersistencia.verificarPessoa(dadosIA.fornecedor.cnpj, 'FORNECEDOR'),
            faturado: await agentePersistencia.verificarPessoa(dadosIA.faturado.cpf, 'FATURADO'),
            classificacao: await agentePersistencia.verificarClassificacao(dadosIA.classificacao_despesa[0] || 'OUTROS'),
        };

        return res.status(200).json(resultadosVerificacao);

    } catch (e) {
        console.error('Erro na Verificação do DB:', e);
        return res.status(500).json({ error: 'Falha durante a consulta de existência no DB.' });
    }
};

export const handlePersistence = async (req, res) => {
    const dadosIA = req.body.dadosIA; 
    const verificacaoDB = req.body.verificacaoDB; 
    
    if (!dadosIA || !verificacaoDB) {
        return res.status(400).json({ error: 'Dados da IA ou resultados de verificação ausentes.' });
    }

    try {
        const resultadoFinal = await agentePersistencia.persistirMovimentoCompleto(
            dadosIA, 
            verificacaoDB 
        );
        
        return res.status(200).json({
            status: 'Persistência Sucesso',
            registroMovimento: resultadoFinal
        });

    } catch (e) {
        console.error('Erro na Persistência:', e);
        if (e.code === 'P2002') {
             return res.status(409).json({ error: 'Conflito: Esta Nota Fiscal já foi lançada para este Fornecedor.' });
        }
        return res.status(500).json({ error: 'Falha durante a persistência no DB. Verifique os logs.' });
    }
};

export const handleHealthCheck = (req, res) => {
    return res.json({ 
        message: 'API nf-organizer rodando! Envie um PDF para /processar-nf.',
        status: 'OK'
    });
};

export const handleConsultaRAG = async (req, res) => {
    const { type, query } = req.body || {};
    if (!type || !query) {
        return res.status(400).json({ error: 'Parâmetros ausentes: forneça "type" e "query".' });
    }

    try {
        let result;
        if (type === 'SIMPLES') {
            result = await agenteRAGSimples.consultar(query);
        } else if (type === 'SEMANTICA') {
            result = await agenteRAGSemantico.consultar(query);
        } else {
            return res.status(400).json({ error: 'Tipo inválido. Use SIMPLES ou SEMANTICA.' });
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error('Erro na consulta RAG:', e);
        const message = e?.message || 'Falha durante a consulta RAG.';
        const stage = e?.stage || undefined;
        return res.status(500).json({ error: message, stage });
    }
};