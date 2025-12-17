import notificationService from '../services/notificationService.js';

// Get user notifications
export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { limit, offset, unreadOnly } = req.query;

        const { count, rows } = await notificationService.getUserNotifications(userId, {
            limit: parseInt(limit) || 20,
            offset: parseInt(offset) || 0,
            unreadOnly: unreadOnly === 'true'
        });

        res.json({
            success: true,
            notifications: rows,
            pagination: {
                total: count,
                limit: parseInt(limit) || 20,
                offset: parseInt(offset) || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get unread count
export const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const count = await notificationService.getUnreadCount(userId);

        res.json({
            success: true,
            count
        });
    } catch (error) {
        next(error);
    }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await notificationService.markAsRead(id, userId);

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        next(error);
    }
};

// Mark all as read
export const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await notificationService.markAllAsRead(userId);

        res.json({
            success: true,
            message: 'Todas las notificaciones marcadas como leídas'
        });
    } catch (error) {
        next(error);
    }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await notificationService.deleteNotification(id, userId);

        res.json({
            success: true,
            message: 'Notificación eliminada'
        });
    } catch (error) {
        next(error);
    }
};

// Create notification (admin only)
export const createNotification = async (req, res, next) => {
    try {
        const { userId, type, title, message, link, priority, metadata } = req.body;

        const notification = await notificationService.createNotification({
            userId,
            type,
            title,
            message,
            link,
            priority,
            metadata
        });

        res.status(201).json({
            success: true,
            notification
        });
    } catch (error) {
        next(error);
    }
};
