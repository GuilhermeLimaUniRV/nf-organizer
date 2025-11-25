import express from 'express';
import cors from 'cors'; 
import invoiceRoutes from './routes/invoiceRoutes.js';
import managementRoutes from './routes/managementRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000; 

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions)); 

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

app.use('/api/notaFiscal', invoiceRoutes);
app.use('/api/gestao', managementRoutes);

const server = app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando na porta http://localhost:${PORT}`);
});

server.timeout = 300000;
