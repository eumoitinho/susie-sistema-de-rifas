import express from 'express';
import cors from 'cors';
import { initDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import rifasRoutes from './routes/rifas.js';
import bilhetesRoutes from './routes/bilhetes.js';
import uploadRoutes from './routes/upload.js';
import pagamentoRoutes from './routes/pagamento.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
initDatabase();

// Static files for PDFs
app.use('/comprovantes', express.static(path.join(__dirname, 'comprovantes')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rifas', rifasRoutes);
app.use('/api/bilhetes', bilhetesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pagamento', pagamentoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

