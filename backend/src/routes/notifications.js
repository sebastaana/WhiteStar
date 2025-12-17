import express from 'express';
import { authJWT, checkRole } from '../middleware/authJWT.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authJWT);

// Get user notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification (admin only)
router.post('/', checkRole('Admin', 'Gerente'), createNotification);

export default router;
