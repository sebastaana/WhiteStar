import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler.js';

export const authJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new CustomError('Token no proporcionado', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new CustomError('Token inválido o expirado', 401));
  }
};

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new CustomError('Permiso insuficiente', 403));
    }
    next();
  };
};