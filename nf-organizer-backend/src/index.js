// src/index.js
import express from 'express';
import multer from 'multer';
import cors from 'cors'; 
import ExtratorDadosAgente from './agents/extrator/ExtratorDadosAgente.js';

// Inicializa o agente e o Multer
const agenteExtrator = new ExtratorDadosAgente();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('pdf_file'); 

const app = express();
const PORT = process.env.PORT || 3000; 

// ------------------------------------
// 1. CONFIGURAÇÕES GLOBAIS E MIDDLEWARES
// ------------------------------------

// CORREÇÃO CORS: Permite a comunicação com o Frontend React na porta 5173
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions)); 

// CORREÇÃO LIMITES: Aumenta o limite de payload para processar o Base64 do PDF
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 


// ---------------------------------
// 2. ROTAS DA API
// ---------------------------------

// Rota de Teste Simples (GET)
app.get('/', (req, res) => {
    return res.json({ 
        message: 'API nf-organizer rodando! Envie um PDF para /processar-nf.',
        status: 'OK'
    });
});

// Rota de Processamento de Nota Fiscal (POST)
app.post('/processar-nf', upload, async (req, res) => {
    
    // Verifica se o Multer encontrou o arquivo e se ele é um PDF
    if (!req.file || req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Nenhum arquivo PDF válido foi enviado. Use o campo "pdf_file".' });
    }

    const pdfBuffer = req.file.buffer;

    // Chama o Agente Extrator com o Buffer do PDF
    const resultado = await agenteExtrator.processarDocumentoFiscal(pdfBuffer);

    // Trata erro retornado pelo Agente Gemini
    if (resultado.error) {
        // Envia o erro do agente com status 500
        return res.status(500).json(resultado); 
    }
    
    // Sucesso: Retorna o JSON extraído
    return res.status(200).json(resultado);
});


// ---------------------------------
// 3. INÍCIO DO SERVIDOR COM TIMEOUT AUMENTADO
// ---------------------------------

const server = app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando na porta http://localhost:${PORT}`);
    // A porta externa mapeada pelo Docker será 8080
});

// CORREÇÃO TIMEOUT: Aumenta o tempo limite para 5 minutos (300.000 ms)
// Isto é CRUCIAL para evitar o erro ECONNABORTED durante o processamento do Gemini.
server.timeout = 300000;