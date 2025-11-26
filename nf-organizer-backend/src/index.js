import express from 'express';
import cors from 'cors'; 
import invoiceRoutes from './routes/invoiceRoutes.js';
import managementRoutes from './routes/managementRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000; 

const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
const allowedSuffixes = (process.env.CORS_ORIGIN_SUFFIXES || '').split(',').filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    const okExact = !origin || allowed.includes(origin);
    const okSuffix = origin && allowedSuffixes.some(suf => origin.endsWith(suf));
    if (okExact || okSuffix) return callback(null, true);
    return callback(new Error('CORS bloqueado'));
  },
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
