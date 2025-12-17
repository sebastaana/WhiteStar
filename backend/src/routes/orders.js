import express from 'express';
import { authJWT } from '../middleware/authJWT.js';
import { hasPermission } from '../middleware/roleMiddleware.js';
import { CustomError } from '../middleware/errorHandler.js';
import { Order, OrderItem, Product, User, Reservation, sequelize } from '../models/index.js';
import notificationService from '../services/notificationService.js';

// Import pdfService only if dependencies are installed
let pdfService = null;
try {
  const module = await import('../services/pdfService.js');
  pdfService = module.default;
} catch (err) {
  console.warn('⚠️  PDF service not available. Install pdfkit and qrcode: npm install pdfkit qrcode');
}

// Import emailService only if dependencies are installed
let emailService = null;
try {
  const module = await import('../services/emailService.js');
  emailService = module.default;
} catch (err) {
  console.warn('⚠️  Email service not available. Install nodemailer: npm install nodemailer');
}

const router = express.Router();

// GET - Órdenes
router.get('/', authJWT, async (req, res, next) => {
  try {
    let whereClause = { user_id: req.user.id };

    // Si tiene permiso para ver todas las órdenes, quitar filtro de usuario
    if (hasPermission(req.user, 'VIEW_ALL_ORDERS')) {
      whereClause = {};
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { model: OrderItem, include: Product },
        { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// GET - Orden por ID (para confirmación/ticket)
router.get('/:id', authJWT, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [
        { model: OrderItem, include: Product },
        { model: Reservation }, // Incluir las reservas generadas
        { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    // Verificar que la orden pertenezca al usuario o sea admin
    if (order.user_id !== req.user.id && !hasPermission(req.user, 'VIEW_ALL_ORDERS')) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});


// GET - Download ticket PDF
router.get('/:id/ticket', authJWT, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [{ model: User, attributes: ['id'] }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    // Verificar que la orden pertenezca al usuario o sea admin
    if (order.user_id !== req.user.id && !hasPermission(req.user, 'VIEW_ALL_ORDERS')) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    // Generate PDF
    const pdfDoc = await pdfService.generateOrderTicket(req.params.id);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${order.id.substring(0, 8)}.pdf`);

    // Pipe PDF to response
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    next(err);
  }
});

// POST - Crear orden desde carrito (Genera Boleta y Reservas)
router.post('/', authJWT, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, tax } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new CustomError('Carrito vacío', 400);
    }

    // Normaliza impuesto en número
    const taxNum = Number.isFinite(+tax) ? +tax : 0;

    let total = 0;
    const orderItems = [];

    // Carga todos los productos de una vez
    const ids = items.map(i => i.product_id);
    const products = await Product.findAll({ where: { id: ids }, transaction: t });

    if (products.length !== ids.length) {
      throw new CustomError('Producto no encontrado', 404);
    }

    // Verificar stock y calcular total
    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (!Number.isInteger(qty) || qty < 1) {
        throw new CustomError('Cantidad inválida', 400);
      }

      const product = products.find(p => p.id === item.product_id);
      if (!product) throw new CustomError('Producto no encontrado', 404);

      if (product.stock < qty) {
        throw new CustomError(`Stock insuficiente para ${product.name}`, 400);
      }

      total += Number(product.price) * qty;

      orderItems.push({
        product_id: product.id,
        quantity: qty,
        price: Number(product.price)
      });
    }

    const finalTotal = +(total + taxNum).toFixed(2);

    // Crea orden (Boleta)
    const order = await Order.create({
      user_id: req.user.id,
      total: finalTotal,
      tax: +taxNum.toFixed(2),
      status: 'Confirmado'
    }, { transaction: t });

    // Crea items, descuenta stock y CREA RESERVAS
    for (const item of orderItems) {
      // 1. Crear Item de Orden
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }, { transaction: t });

      // 2. Descontar Stock
      await Product.decrement(
        { stock: item.quantity },
        { where: { id: item.product_id }, transaction: t }
      );

      // 3. Crear Reserva (NUEVO - Requerimiento de Usuario)
      // Fecha de expiración: 7 días desde hoy
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      await Reservation.create({
        user_id: req.user.id,
        product_id: item.product_id,
        quantity: item.quantity,
        status: 'Confirmada', // Pagada y confirmada
        reservation_date: new Date(),
        expiry_date: expiryDate,
        total_price: item.price * item.quantity,
        order_id: order.id, // Vinculación con la boleta
        notes: 'Reserva generada automáticamente por compra online'
      }, { transaction: t });
    }

    await t.commit();

    // Enviar notificación al usuario
    try {
      await notificationService.notifyOrderCreated(req.user.id, order.id, finalTotal);
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // No fallar la orden si falla la notificación
    }

    // Enviar email de confirmación
    if (emailService) {
      try {
        await emailService.sendOrderCreated(order, req.user);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // No fallar la orden si falla el email
      }
    }

    res.status(201).json({
      success: true,
      order: { id: order.id, total: order.total, status: order.status }
    });
  } catch (err) {
    if (t) await t.rollback();
    next(err);
  }
});

export default router;