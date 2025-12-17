import express from 'express';
import { authJWT as authenticate } from '../middleware/authJWT.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import {
    searchCustomers,
    getCustomerProfile,
    searchOrders,
    searchReservations,
    updateOrderStatus,
    confirmReservation
} from '../controllers/customerServiceController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Customer Management
router.get('/customers/search', requirePermission('VIEW_CUSTOMER_PROFILES'), searchCustomers);
router.get('/customers/:id/profile', requirePermission('VIEW_CUSTOMER_HISTORY'), getCustomerProfile);

// Order Management
router.get('/orders/search', requirePermission('VIEW_ALL_ORDERS'), searchOrders);
router.put('/orders/:id/status', requirePermission('UPDATE_ORDER_STATUS'), updateOrderStatus);

// Reservation Management
router.get('/reservations/search', requirePermission('VIEW_ALL_RESERVATIONS'), searchReservations);
router.put('/reservations/:id/confirm', requirePermission('CONFIRM_RESERVATIONS'), confirmReservation);

export default router;
