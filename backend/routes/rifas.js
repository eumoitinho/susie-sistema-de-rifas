import express from 'express';
import { run, get, all } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function toAbsolute(req, url) {
  if (!url) return url;
  if (typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http');
  const host = req.get('host');
  const base = process.env.BACKEND_PUBLIC_URL || `${proto}://${host}`;
  return `${base}${url}`;
}

// Rotas públicas
router.get('/public/list', async (req, res) => {
  try {
    const rifas = await all(`
      SELECT
        r.*,
        (
          SELECT COUNT(*)
          FROM bilhetes b
          WHERE b.rifa_id = r.id
        ) AS cotas_vendidas
      FROM rifas r
      ORDER BY r.created_at DESC
    `);

    const fotos = await all('SELECT rifa_id, url FROM fotos ORDER BY ordem, id');
    const fotoMap = new Map();
    fotos.forEach((foto) => {
      if (!fotoMap.has(foto.rifa_id)) {
        fotoMap.set(foto.rifa_id, foto.url);
      }
    });

  const response = rifas.map((rifa) => {
      const vendidos = Number(rifa.cotas_vendidas || 0);
      const total = Number(rifa.numero_max || 0);
      return {
        id: rifa.id,
        titulo: rifa.titulo,
        descricao: rifa.descricao,
        foto_capa: toAbsolute(req, fotoMap.get(rifa.id) || rifa.foto_url || null),
        valor_bilhete: rifa.valor_bilhete,
        data_sorteio: rifa.data_sorteio,
        numero_max: total,
        cotas_vendidas: vendidos,
        cotas_disponiveis: Math.max(total - vendidos, 0),
        created_at: rifa.created_at,
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Get public rifas error:', error);
    res.status(500).json({ error: 'Erro ao listar rifas públicas' });
  }
});

// Middleware de autenticação apenas para algumas rotas
const authMiddleware = authenticateToken;

// Rotas que exigem autenticação
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rifas = await all('SELECT * FROM rifas WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId]);
    res.json(rifas);
  } catch (error) {
    console.error('Get rifas error:', error);
    res.status(500).json({ error: 'Erro ao listar rifas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Tentar autenticar se houver token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    let isOwner = false;
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_key_aqui_mude_em_producao';
        const decoded = jwt.default.verify(token, JWT_SECRET);
        req.user = decoded;
        isOwner = true;
      } catch (e) {
        // Token inválido, continuar sem autenticação
      }
    }
    
    if (isOwner && req.user && req.user.userId) {
      // Se está logado, verificar se é dono
      const rifa = await get('SELECT * FROM rifas WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
      if (!rifa) return res.status(404).json({ error: 'Rifa nao encontrada' });

      const bilhetes = await all('SELECT numero FROM bilhetes WHERE rifa_id = ?', [req.params.id]);
      rifa.numeros_ocupados = bilhetes.map(b => b.numero);
      rifa.numeros_disponiveis = Array.from({ length: rifa.numero_max }, (_, i) => i + 1).filter(num => !rifa.numeros_ocupados.includes(num));

      const fotos = await all('SELECT url, tipo FROM fotos WHERE rifa_id = ? ORDER BY ordem, id', [req.params.id]);
      rifa.fotos = fotos.map(f => ({ url: toAbsolute(req, f.url), tipo: f.tipo || 'foto' }));
      if (rifa.foto_url) {
        rifa.foto_url = toAbsolute(req, rifa.foto_url);
      }

      res.json(rifa);
    } else {
      // Se não está logado, retornar rifa pública
      const rifa = await get('SELECT * FROM rifas WHERE id = ?', [req.params.id]);
      if (!rifa) return res.status(404).json({ error: 'Rifa nao encontrada' });

      const bilhetes = await all('SELECT numero FROM bilhetes WHERE rifa_id = ?', [req.params.id]);
      rifa.numeros_ocupados = bilhetes.map(b => b.numero);
      rifa.numeros_disponiveis = Array.from({ length: rifa.numero_max }, (_, i) => i + 1).filter(num => !rifa.numeros_ocupados.includes(num));

      const fotos = await all('SELECT url, tipo FROM fotos WHERE rifa_id = ? ORDER BY ordem, id', [req.params.id]);
      rifa.fotos = fotos.map(f => ({ url: toAbsolute(req, f.url), tipo: f.tipo || 'foto' }));
      if (rifa.foto_url) {
        rifa.foto_url = toAbsolute(req, rifa.foto_url);
      }

      res.json(rifa);
    }
  } catch (error) {
    console.error('Get rifa error:', error);
    res.status(500).json({ error: 'Erro ao buscar rifa' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, foto_url, valor_bilhete, data_sorteio, numero_max } = req.body;

    if (!titulo || !data_sorteio || !numero_max || !valor_bilhete) {
      return res.status(400).json({ error: 'Titulo, data de sorteio, numero maximo e valor do bilhete sao obrigatorios' });
    }

    const result = await run(
      'INSERT INTO rifas (user_id, titulo, descricao, foto_url, valor_bilhete, data_sorteio, numero_max) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.userId, titulo, descricao || null, foto_url || null, valor_bilhete, data_sorteio, numero_max]
    );

    const novaRifa = await get('SELECT * FROM rifas WHERE id = ?', [result.lastID]);
    res.status(201).json({
      message: 'Rifa criada com sucesso',
      rifa: novaRifa
    });
  } catch (error) {
    console.error('Create rifa error:', error);
    res.status(500).json({ error: 'Erro ao criar rifa' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, foto_url, valor_bilhete, data_sorteio, numero_max } = req.body;
    const rifa = await get('SELECT * FROM rifas WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    if (!rifa) return res.status(404).json({ error: 'Rifa nao encontrada' });

    await run(
      'UPDATE rifas SET titulo = ?, descricao = ?, foto_url = ?, valor_bilhete = ?, data_sorteio = ?, numero_max = ? WHERE id = ? AND user_id = ?',
      [
        titulo !== undefined ? titulo : rifa.titulo,
        descricao !== undefined ? descricao : rifa.descricao,
        foto_url !== undefined ? foto_url : rifa.foto_url,
        valor_bilhete !== undefined ? valor_bilhete : rifa.valor_bilhete,
        data_sorteio !== undefined ? data_sorteio : rifa.data_sorteio,
        numero_max !== undefined ? numero_max : rifa.numero_max,
        req.params.id,
        req.user.userId
      ]
    );

    res.json({ message: 'Rifa atualizada com sucesso' });
  } catch (error) {
    console.error('Update rifa error:', error);
    res.status(500).json({ error: 'Erro ao atualizar rifa' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const rifa = await get('SELECT * FROM rifas WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    if (!rifa) return res.status(404).json({ error: 'Rifa nao encontrada' });

    await run('DELETE FROM bilhetes WHERE rifa_id = ?', [req.params.id]);
    await run('DELETE FROM rifas WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);

    res.json({ message: 'Rifa deletada com sucesso' });
  } catch (error) {
    console.error('Delete rifa error:', error);
    res.status(500).json({ error: 'Erro ao deletar rifa' });
  }
});

export default router;
