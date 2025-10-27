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

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) cb(null, true);
    else cb(new Error('Apenas imagens sao permitidas'));
  }
});

router.post('/rifa/:rifaId', authenticateToken, upload.array('fotos', 10), async (req, res) => {
  try {
    const { rifaId } = req.params;
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Nenhuma foto enviada' });
    if (req.files.length > 10) return res.status(400).json({ error: 'Maximo de 10 fotos' });

    const fotosSalvas = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const url = `/uploads/${file.filename}`;
      await run('INSERT INTO fotos (rifa_id, url, ordem) VALUES (?, ?, ?)', [rifaId, url, i]);
      fotosSalvas.push({ url, filename: file.filename });
    }

    res.json({ message: 'Fotos enviadas com sucesso', fotos: fotosSalvas });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Erro ao fazer upload das fotos' });
  }
});

export default router;
