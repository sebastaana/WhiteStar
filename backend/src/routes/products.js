import express from 'express';
import { query, body, param, validationResult } from 'express-validator';
import { authJWT, checkRole } from '../middleware/authJWT.js';
import { upload } from '../middleware/uploadConfig.js';
import { CustomError } from '../middleware/errorHandler.js';
import { Product, Category } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// ========== GET - Catálogo con filtros y paginación ==========
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('q').optional().trim().escape(), // Sanitizar búsqueda
  query('category').optional().trim().escape(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat()
], async (req, res, next) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 12;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.q) where.name = { [Op.like]: `%${req.query.q}%` };
    if (req.query.minPrice) where.price = { [Op.gte]: req.query.minPrice };
    if (req.query.maxPrice) {
      where.price = { ...where.price, [Op.lte]: req.query.maxPrice };
    }

    const categoryWhere = {};
    if (req.query.category) categoryWhere.name = req.query.category;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          where: categoryWhere,
          required: !!req.query.category,
          attributes: ['id', 'name', 'description'] // Limitar campos expuestos
        }
      ],
      attributes: {
        exclude: ['vendor_id'] // No exponer vendor_id innecesariamente
      },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Formatear fechas para ocultar timestamps Unix
    const formattedProducts = rows.map(p => {
      const product = p.toJSON();
      // Opcional: remover o formatear fechas
      delete product.created_at;
      delete product.updated_at;
      return product;
    });

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// ========== GET - Detalle producto ==========
router.get('/:id', [
  param('id').isUUID().withMessage('ID inválido')
], async (req, res, next) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Category,
        attributes: ['id', 'name', 'description']
      }],
      attributes: {
        exclude: ['vendor_id', 'created_at', 'updated_at']
      }
    });

    if (!product) {
      return next(new CustomError('Producto no encontrado', 404));
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

// ========== POST - Crear producto (Vendedor/Admin) ==========
router.post('/', authJWT, checkRole('Vendedor', 'Admin'), upload.single('image'), [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Nombre debe tener entre 3 y 200 caracteres')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Descripción muy larga')
    .escape(),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Precio debe ser mayor a 0'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock debe ser un número entero positivo'),
  body('category_id')
    .isUUID()
    .withMessage('ID de categoría inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Verificar que la categoría existe
    const category = await Category.findByPk(req.body.category_id);
    if (!category) {
      return next(new CustomError('Categoría no encontrada', 404));
    }

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id,
      image_url: req.file ? `/uploads/products/${req.file.filename}` : null,
      vendor_id: req.user.id
    });

    // No devolver vendor_id ni timestamps
    const response = product.toJSON();
    delete response.vendor_id;
    delete response.created_at;
    delete response.updated_at;

    res.status(201).json({ success: true, product: response });
  } catch (err) {
    next(err);
  }
});

// ========== PUT - Actualizar producto (Vendedor/Admin) ==========
router.put('/:id', authJWT, checkRole('Vendedor', 'Admin'), upload.single('image'), [
  param('id').isUUID().withMessage('ID inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .escape(),
  body('price')
    .optional()
    .isFloat({ min: 0.01 }),
  body('stock')
    .optional()
    .isInt({ min: 0 }),
  body('category_id')
    .optional()
    .isUUID()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return next(new CustomError('Producto no encontrado', 404));
    }

    // Verificar ownership (solo vendor o admin)
    if (product.vendor_id !== req.user.id && req.user.role !== 'Admin') {
      return next(new CustomError('No tienes permiso para actualizar este producto', 403));
    }

    // Si se cambia categoría, verificar que existe
    if (req.body.category_id && req.body.category_id !== product.category_id) {
      const category = await Category.findByPk(req.body.category_id);
      if (!category) {
        return next(new CustomError('Categoría no encontrada', 404));
      }
    }

    // Actualizar solo campos permitidos
    const allowedFields = ['name', 'description', 'price', 'stock', 'category_id'];
    const updates = {};

    if (req.file) {
      updates.image_url = `/uploads/products/${req.file.filename}`;
    }
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await product.update(updates);

    // Respuesta sin datos sensibles
    const response = product.toJSON();
    delete response.vendor_id;
    delete response.created_at;
    delete response.updated_at;

    res.json({ success: true, product: response });
  } catch (err) {
    next(err);
  }
});

// ========== DELETE - Eliminar producto (Vendedor/Admin) ==========
router.delete('/:id', authJWT, checkRole('Vendedor', 'Admin'), [
  param('id').isUUID().withMessage('ID inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return next(new CustomError('Producto no encontrado', 404));
    }

    // Verificar ownership
    if (product.vendor_id !== req.user.id && req.user.role !== 'Admin') {
      return next(new CustomError('No tienes permiso para eliminar este producto', 403));
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
