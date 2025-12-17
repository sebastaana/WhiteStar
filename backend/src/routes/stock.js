import express from 'express';
import { authJWT as authenticate } from '../middleware/authJWT.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import {
    updateStock,
    getStockAlerts,
    acknowledgeAlert,
    getStockMovements,
    createStockMovement,
    getStockReport,
    bulkUpdateStock,
    getStockPatterns
} from '../controllers/stockController.js';

const router = express.Router();

// All routes require authentication and stock management permission
router.use(authenticate);

router.put('/:productId', requirePermission('UPDATE_STOCK'), updateStock);
router.post('/bulk-update', requirePermission('UPDATE_STOCK'), bulkUpdateStock);

router.get('/alerts', requirePermission('VIEW_STOCK_ALERTS'), getStockAlerts);
router.put('/alerts/:id/acknowledge', requirePermission('VIEW_STOCK_ALERTS'), acknowledgeAlert);

router.get('/movements', requirePermission('MANAGE_STOCK_MOVEMENTS'), getStockMovements);
router.post('/movements', requirePermission('MANAGE_STOCK_MOVEMENTS'), createStockMovement);

router.get('/report', requirePermission('VIEW_STOCK'), getStockReport);
router.get('/patterns', requirePermission('VIEW_STOCK'), getStockPatterns);

export default router;
