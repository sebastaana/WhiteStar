import express from 'express';
import { authJWT as authenticate } from '../middleware/authJWT.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import {
    createReservation,
    getReservations,
    getMyReservations,
    getReservationById,
    updateReservationStatus,
    confirmReservation,
    cancelReservation,
    getReservationConfirmation
} from '../controllers/reservationController.js';

const router = express.Router();

// Public/Customer routes
router.post('/', authenticate, createReservation);
router.get('/my', authenticate, getMyReservations);
router.get('/:id/confirmation', authenticate, getReservationConfirmation);

// Staff routes
router.get('/', authenticate, requirePermission('VIEW_ALL_RESERVATIONS'), getReservations);
router.get('/:id', authenticate, getReservationById);
router.put('/:id/status', authenticate, requirePermission('CONFIRM_RESERVATION'), updateReservationStatus);
router.post('/:id/confirm', authenticate, requirePermission('CONFIRM_RESERVATION'), confirmReservation);
router.delete('/:id', authenticate, cancelReservation);

export default router;
