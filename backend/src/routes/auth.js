import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authJWT } from '../middleware/authJWT.js';
import { CustomError } from '../middleware/errorHandler.js';
import { User, Role } from '../models/index.js';

const router = express.Router();

// Registro
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').notEmpty(),
  body('last_name').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new CustomError('Email ya registrado', 400));
    }

    let clientRole = await Role.findOne({ where: { name: 'Cliente' } });

    // Si no existe el rol Cliente, crearlo automáticamente
    if (!clientRole) {
      clientRole = await Role.create({ name: 'Cliente', description: 'Cliente regular' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password_hash: hashedPassword,
      first_name,
      last_name,
      role_id: clientRole.id
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'Cliente' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, first_name, last_name }
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }, include: Role });

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return next(new CustomError('Credenciales inválidas', 401));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.Role.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.Role.name }
    });
  } catch (err) {
    next(err);
  }
});

// Get perfil
router.get('/me', authJWT, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { include: Role });
    res.json({
      success: true,
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.Role.name }
    });
  } catch (err) {
    next(err);
  }
});

export default router;