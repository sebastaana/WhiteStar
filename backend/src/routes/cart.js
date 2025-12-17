import express from 'express';
import { authJWT } from '../middleware/authJWT.js';
import { Product } from '../models/index.js';

const router = express.Router();

// Simulamos carrito en cliente, pero podemos traer detalles de productos
router.post('/validate', authJWT, async (req, res, next) => {
  try {
    const { items } = req.body; // [{ product_id, quantity }]
    const products = await Product.findAll({
      where: { id: items.map(i => i.product_id) }
    });

    const validatedItems = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        available: product && product.stock >= item.quantity,
        price: product?.price,
        stock: product?.stock
      };
    });

    res.json({ success: true, items: validatedItems });
  } catch (err) {
    next(err);
  }
});

export default router;