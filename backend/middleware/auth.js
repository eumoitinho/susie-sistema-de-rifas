import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '6DbeXbvDyFi26+TcVZMPseRZ+7bNqHYCUZzvdwlRbxs=';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

export { JWT_SECRET };


