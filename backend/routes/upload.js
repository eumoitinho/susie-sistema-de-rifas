import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuração para imagens (até 10MB)
const imageUpload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  }
});

// Configuração para vídeos (até 50MB)
const videoUpload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|webm|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /video\//.test(file.mimetype);
    if (mimetype && extname) cb(null, true);
    else cb(new Error('Apenas vídeos são permitidos'));
  }
});

// Upload de fotos e vídeos usando multer.fields
const uploadFields = (req, res, next) => {
  const imageFields = imageUpload.fields([{ name: 'fotos', maxCount: 10 }]);
  const videoFields = videoUpload.fields([{ name: 'videos', maxCount: 2 }]);
  
  // Primeiro processa imagens
  imageFields(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    
    // Depois processa vídeos
    videoFields(req, res, (err2) => {
      if (err2) return res.status(400).json({ error: err2.message });
      next();
    });
  });
};

router.post('/rifa/:rifaId', authenticateToken, uploadFields, async (req, res) => {
  try {
    const { rifaId } = req.params;
    
    const fotos = req.files?.fotos || [];
    const videos = req.files?.videos || [];
    
    if (fotos.length === 0 && videos.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    if (fotos.length > 10) {
      return res.status(400).json({ error: 'Máximo de 10 fotos' });
    }
    
    if (videos.length > 2) {
      return res.status(400).json({ error: 'Máximo de 2 vídeos' });
    }
    
    const arquivosSalvos = [];
    let ordem = 0;
    
    // Salvar fotos
    for (const file of fotos) {
      const url = `/uploads/${file.filename}`;
      await run('INSERT INTO fotos (rifa_id, url, ordem, tipo) VALUES (?, ?, ?, ?)', [rifaId, url, ordem++, 'foto']);
      arquivosSalvos.push({ url, filename: file.filename, tipo: 'foto' });
    }
    
    // Salvar vídeos
    for (const file of videos) {
      const url = `/uploads/${file.filename}`;
      await run('INSERT INTO fotos (rifa_id, url, ordem, tipo) VALUES (?, ?, ?, ?)', [rifaId, url, ordem++, 'video']);
      arquivosSalvos.push({ url, filename: file.filename, tipo: 'video' });
    }
    
    res.json({ message: 'Arquivos enviados com sucesso', arquivos: arquivosSalvos });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Erro ao fazer upload dos arquivos' });
  }
});

export default router;
