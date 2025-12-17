import jwt from 'jsonwebtoken';

// Lee el token del header Authorization: Bearer <token>
export function authenticateToken(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Token requerido' });

    const secret = process.env.JWT_SECRET || 'dev_secret_key_change_me';
    const payload = jwt.verify(token, secret);

    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}
