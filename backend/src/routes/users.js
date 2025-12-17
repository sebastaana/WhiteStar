import express from 'express';
import { authJWT } from '../middleware/authJWT.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import { CustomError } from '../middleware/errorHandler.js';
import { User, Role } from '../models/index.js';

const router = express.Router();

// GET - Todos los usuarios (Gerente/Admin)
router.get('/', authJWT, requirePermission('MANAGE_USERS'), async (req, res, next) => {
  try {
    const users = await User.findAll({ include: Role });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// PUT - Cambiar rol de usuario (Gerente/Admin)
router.put('/:id/role', authJWT, requirePermission('MANAGE_PERMISSIONS'), async (req, res, next) => {
  try {
    const { role_name } = req.body;
    const role = await Role.findOne({ where: { name: role_name } });
    if (!role) return next(new CustomError('Rol no existe', 400));

    const user = await User.findByPk(req.params.id);
    if (!user) return next(new CustomError('Usuario no encontrado', 404));

    user.role_id = role.id;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// PUT - Actualizar datos de usuario (Admin)
router.put('/:id', authJWT, requirePermission('MANAGE_USERS'), async (req, res, next) => {
  try {
    const { first_name, last_name, email } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return next(new CustomError('Usuario no encontrado', 404));

    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.email = email || user.email;

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// PUT - Cambiar estado (Suspender/Activar) (Admin)
router.put('/:id/status', authJWT, requirePermission('MANAGE_USERS'), async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return next(new CustomError('Usuario no encontrado', 404));

    user.is_active = is_active;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

export default router;