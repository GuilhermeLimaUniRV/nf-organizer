import express from 'express';
import { 
    handleExtraction, 
    handleVerification, 
    handlePersistence,
    handleHealthCheck 
} from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/', handleHealthCheck);

router.post('/processar-nf', handleExtraction);

router.post('/verificar-existencia', handleVerification);

router.post('/persistir-movimento', handlePersistence);

export default router;