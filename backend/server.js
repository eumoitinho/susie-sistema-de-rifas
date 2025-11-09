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
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;
const HOST = process.env.HOST || '0.0.0.0';

// Create necessary directories
const uploadsDir = path.join(__dirname, 'uploads');
const comprovantesDir = path.join(__dirname, 'comprovantes');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(comprovantesDir)) {
  fs.mkdirSync(comprovantesDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
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

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

