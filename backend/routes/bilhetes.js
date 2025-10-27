import express from 'express';
import { run, get, all } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Listar bilhetes de uma rifa
router.get('/rifa/:rifaId', async (req, res) => {
  try {
    const rifaId = req.params.rifaId;
    
    // Verificar se a rifa pertence ao usuário
    const rifa = await get('SELECT user_id FROM rifas WHERE id = ?', [rifaId]);
    if (!rifa || rifa.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Voce nao tem permissao' });
    }

    const bilhetes = await all('SELECT * FROM bilhetes WHERE rifa_id = ? ORDER BY numero ASC', [rifaId]);
    res.json(bilhetes);
  } catch (error) {
    console.error('List bilhetes error:', error);
    res.status(500).json({ error: 'Erro ao listar bilhetes' });
  }
});

export default router;
