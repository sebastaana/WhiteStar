import express from 'express';
import { authJWT as authenticate } from '../middleware/authJWT.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import {
    getSalesReport,
    getInventoryReport,
    getCustomerReport,
    getDashboardSummary
} from '../controllers/reportController.js';

const router = express.Router();

// All routes require authentication and manager/admin permissions
router.use(authenticate);

// Dashboard summary (accessible to more roles)
router.get('/dashboard', requirePermission('VIEW_SALES_REPORTS'), getDashboardSummary);

// Sales reports (Manager, Admin only)
router.get('/sales', requirePermission('VIEW_SALES_REPORTS'), getSalesReport);

// Inventory reports (Inventory Manager, Manager, Admin)
router.get('/inventory', requirePermission('VIEW_INVENTORY_REPORTS'), getInventoryReport);

// Customer reports (Manager, Admin only)
router.get('/customers', requirePermission('VIEW_SALES_REPORTS'), getCustomerReport);

export default router;
