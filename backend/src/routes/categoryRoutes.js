import express from 'express';
import { Category } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['created_at','DESC']] });
    res.json({ categories });
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
});

// POST /api/categories (solo Admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Nombre requerido' });

    const cat = await Category.create({ name, description });
    res.status(201).json({ category: cat });
  } catch (e) {
    res.status(500).json({ message: 'Error al crear categoría' });
  }
});

// PUT /api/categories/:id (solo Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });

    const { name, description } = req.body;
    await cat.update({ name: name ?? cat.name, description: description ?? cat.description });
    res.json({ category: cat });
  } catch (e) {
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
});

// DELETE /api/categories/:id (solo Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });
    await cat.destroy();
    res.json({ message: 'Categoría eliminada' });
  } catch (e) {
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
});

export default router;
