import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';

// Verificar JWT desde cookie httpOnly [web:178][web:181]
export const authJWT = async (req, res, next) => {
  try {
    // Lee token de cookie httpOnly (más seguro que localStorage)
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario aún existe
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Verificar rol de administrador [web:169]
export const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { include: Role });

    if (!user || user.Role.name !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Requiere privilegios de administrador.'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};
