import express from 'express';
import { 
    handleExtraction, 
    handleVerification, 
    handlePersistence,
    handleHealthCheck,
    handleConsultaRAG 
} from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/', handleHealthCheck);

router.post('/processar-nf', handleExtraction);

router.post('/verificar-existencia', handleVerification);

router.post('/persistir-movimento', handlePersistence);

// Nova rota: consulta RAG (SIMPLES ou SEMANTICA)
router.post('/consultaRAG', handleConsultaRAG);

export default router;