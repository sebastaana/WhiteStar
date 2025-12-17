import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsConfig } from './middleware/corsConfig.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityMiddleware } from './config/security.js';
import path from 'path';

// Importar rutas
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reservationRoutes from './routes/reservations.js';
import promotionRoutes from './routes/promotions.js';
import complaintRoutes from './routes/complaints.js';
import stockRoutes from './routes/stock.js';
import reportRoutes from './routes/reports.js';
import customerServiceRoutes from './routes/customerService.js';
import notificationRoutes from './routes/notifications.js';
import taskRoutes from './routes/tasks.js';

const app = express();

// ========== 1. SEGURIDAD (PRIMERO) ==========
securityMiddleware(app);

// ========== 2. PARSERS Y COOKIES ==========
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('📂 Sirviendo archivos estáticos desde:', uploadsPath);
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

// ========== 3. CORS ==========
app.use(cors(corsConfig));

// ========== 4. SECURITY HEADERS ==========
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ========== 5. HEALTH CHECK (antes de rutas API) ==========
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// ========== 6. RUTAS DE LA API ==========
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customer-service', customerServiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tasks', taskRoutes);

// Log de todas las rutas registradas (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('\n📍 Rutas montadas:');
  console.log('   /api/auth');
  console.log('   /api/products');
  console.log('   /api/orders');
  console.log('   /api/users');
  console.log('   /api/cart');
  console.log('   /api/categories');
  console.log('   /api/reservations');
  console.log('   /api/promotions');
  console.log('   /api/complaints');
  console.log('   /api/stock');
  console.log('   /api/reports');
  console.log('   /api/customer-service');
  console.log('   /api/notifications');
  console.log('   /api/tasks\n');
}

// ========== 7. MANEJADOR 404 (después de todas las rutas) ==========
app.use((req, res) => {
  console.log('❌ 404 - Ruta no encontrada:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// ========== 8. MANEJADOR DE ERRORES (al final de todo) ==========
app.use(errorHandler);

export default app;