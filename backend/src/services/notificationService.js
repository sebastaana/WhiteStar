import { Notification, User } from '../models/index.js';

class NotificationService {
    /**
     * Create a notification for a user
     */
    async createNotification({ userId, type, title, message, link, priority = 'medium', metadata = {} }) {
        try {
            const notification = await Notification.create({
                user_id: userId,
                type,
                title,
                message,
                link,
                priority,
                metadata
            });
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Create notifications for multiple users
     */
    async createBulkNotifications(userIds, { type, title, message, link, priority, metadata }) {
        try {
            const notifications = userIds.map(userId => ({
                user_id: userId,
                type,
                title,
                message,
                link,
                priority,
                metadata
            }));

            return await Notification.bulkCreate(notifications);
        } catch (error) {
            console.error('Error creating bulk notifications:', error);
            throw error;
        }
    }

    /**
     * Notification templates for common events
     */
    async notifyOrderCreated(userId, orderId, orderTotal) {
        return this.createNotification({
            userId,
            type: 'order_created',
            title: '¡Pedido Creado!',
            message: `Tu pedido #${orderId} por $${orderTotal.toLocaleString()} ha sido creado exitosamente.`,
            link: `/profile`,
            priority: 'high',
            metadata: { orderId, orderTotal }
        });
    }

    async notifyOrderUpdated(userId, orderId, newStatus) {
        const statusMessages = {
            'Pendiente': 'está pendiente de confirmación',
            'Confirmado': 'ha sido confirmado',
            'Enviado': 'ha sido enviado',
            'Entregado': 'ha sido entregado',
            'Cancelado': 'ha sido cancelado'
        };

        return this.createNotification({
            userId,
            type: 'order_updated',
            title: 'Estado de Pedido Actualizado',
            message: `Tu pedido #${orderId} ${statusMessages[newStatus] || 'ha sido actualizado'}.`,
            link: `/profile`,
            priority: newStatus === 'Entregado' ? 'high' : 'medium',
            metadata: { orderId, status: newStatus }
        });
    }

    async notifyReservationConfirmed(userId, reservationId, productName) {
        return this.createNotification({
            userId,
            type: 'reservation_confirmed',
            title: 'Reserva Confirmada',
            message: `Tu reserva de "${productName}" ha sido confirmada.`,
            link: `/reservations`,
            priority: 'high',
            metadata: { reservationId, productName }
        });
    }

    async notifyStockAlert(adminUserIds, productName, currentStock) {
        return this.createBulkNotifications(adminUserIds, {
            type: 'stock_alert',
            title: 'Alerta de Stock Bajo',
            message: `El producto "${productName}" tiene stock bajo (${currentStock} unidades).`,
            link: `/stock-management`,
            priority: 'high',
            metadata: { productName, currentStock }
        });
    }

    async notifyPaymentReceived(userId, orderId, amount) {
        return this.createNotification({
            userId,
            type: 'payment_received',
            title: 'Pago Recibido',
            message: `Hemos recibido tu pago de $${amount.toLocaleString()} para el pedido #${orderId}.`,
            link: `/profile`,
            priority: 'high',
            metadata: { orderId, amount }
        });
    }

    async notifyComplaintAssigned(userId, complaintId, assignedBy) {
        return this.createNotification({
            userId,
            type: 'complaint_assigned',
            title: 'Reclamo Asignado',
            message: `Se te ha asignado un nuevo reclamo #${complaintId}.`,
            link: `/customer-service/dashboard`,
            priority: 'high',
            metadata: { complaintId, assignedBy }
        });
    }

    async notifyTaskAssigned(userId, taskId, taskTitle) {
        return this.createNotification({
            userId,
            type: 'task_assigned',
            title: 'Nueva Tarea Asignada',
            message: `Se te ha asignado la tarea: "${taskTitle}".`,
            link: `/tasks`,
            priority: 'medium',
            metadata: { taskId, taskTitle }
        });
    }

    /**
     * Get user notifications
     */
    async getUserNotifications(userId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
        const where = { user_id: userId };
        if (unreadOnly) {
            where.read = false;
        }

        return await Notification.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            where: { id: notificationId, user_id: userId }
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        notification.read = true;
        await notification.save();
        return notification;
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        return await Notification.update(
            { read: true },
            { where: { user_id: userId, read: false } }
        );
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId, userId) {
        return await Notification.destroy({
            where: { id: notificationId, user_id: userId }
        });
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId) {
        return await Notification.count({
            where: { user_id: userId, read: false }
        });
    }
}

export default new NotificationService();
