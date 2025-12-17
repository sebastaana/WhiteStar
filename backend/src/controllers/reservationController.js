import { Reservation, Product, User, Payment, StockMovement } from '../models/index.js';
import { Op } from 'sequelize';
import notificationService from '../services/notificationService.js';

// Import emailService only if dependencies are installed
let emailService = null;
try {
    const module = await import('../services/emailService.js');
    emailService = module.default;
} catch (err) {
    console.warn('⚠️  Email service not available');
}

/**
 * Create a new reservation
 */
export const createReservation = async (req, res) => {
    try {
        const { product_id, quantity, pickup_date, notes } = req.body;
        const user_id = req.user.id;

        // Validate product exists and has enough stock
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const availableStock = product.stock - product.reserved_stock;
        if (availableStock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Stock insuficiente. Disponible: ${availableStock}`
            });
        }

        // Calculate expiry date (48 hours from now)
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 48);

        // Calculate total price
        const totalPrice = parseFloat(product.price) * quantity;

        // Create reservation
        const reservation = await Reservation.create({
            user_id,
            product_id,
            quantity,
            pickup_date: pickup_date || null,
            notes,
            expiry_date: expiryDate,
            total_price: totalPrice,
            status: 'Pendiente'
        });

        // Update reserved stock
        await product.update({
            reserved_stock: product.reserved_stock + quantity
        });

        // Create stock movement for reservation
        try {
            await StockMovement.create({
                product_id,
                movement_type: 'reserva',
                quantity: quantity,
                previous_stock: product.stock, // Stock doesn't change yet, only reserved
                new_stock: product.stock,
                reason: 'Nueva reserva',
                performed_by: user_id,
                reference_id: reservation.id,
                reference_type: 'reservation'
            });
        } catch (err) {
            console.error('Error creating stock movement for reservation:', err);
        }

        // Fetch complete reservation with associations
        const completeReservation = await Reservation.findByPk(reservation.id, {
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image_url'] },
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        // Send notification to user
        try {
            await notificationService.createNotification({
                userId: user_id,
                type: 'reservation_confirmed',
                title: 'Reserva Creada',
                message: `Tu reserva de "${product.name}" ha sido creada. Expira en 48 horas.`,
                link: '/reservations',
                priority: 'high',
                metadata: { reservationId: reservation.id, productName: product.name }
            });
        } catch (notifError) {
            console.error('Error sending notification:', notifError);
        }

        // Send confirmation email
        if (emailService) {
            try {
                await emailService.sendReservationConfirmation(
                    completeReservation,
                    completeReservation.customer,
                    completeReservation.Product
                );
            } catch (emailError) {
                console.error('Error sending email:', emailError);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            data: completeReservation
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la reserva',
            error: error.message
        });
    }
};

/**
 * Get all reservations with filters
 */
export const getReservations = async (req, res) => {
    try {
        const { status, user_id, product_id, page = 1, limit = 20 } = req.query;
        const userRole = req.user.role || req.user.Role?.name;

        const where = {};

        // If not admin/manager/customer service, only show own reservations
        if (!['Admin', 'Gerente', 'Atención al Cliente', 'Vendedor'].includes(userRole)) {
            where.user_id = req.user.id;
        } else if (user_id) {
            where.user_id = user_id;
        }

        if (status) where.status = status;
        if (product_id) where.product_id = product_id;

        const offset = (page - 1) * limit;

        const { count, rows: reservations } = await Reservation.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image_url'] },
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'confirmer', attributes: ['id', 'first_name', 'last_name'], required: false }
            ]
        });

        res.json({
            success: true,
            data: reservations,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reservas',
            error: error.message
        });
    }
};

/**
 * Get user's own reservations
 */
export const getMyReservations = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = { user_id: req.user.id };

        if (status) where.status = status;

        const offset = (page - 1) * limit;

        const { count, rows: reservations } = await Reservation.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image_url', 'stock'] }
            ]
        });

        res.json({
            success: true,
            data: reservations,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching my reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tus reservas',
            error: error.message
        });
    }
};

/**
 * Get reservation by ID
 */
export const getReservationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role || req.user.Role?.name;

        const reservation = await Reservation.findByPk(id, {
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image_url', 'stock'] },
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'confirmer', attributes: ['id', 'first_name', 'last_name'], required: false },
                { model: Payment, required: false }
            ]
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Check permissions
        if (!['Admin', 'Gerente', 'Atención al Cliente', 'Vendedor'].includes(userRole) &&
            reservation.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver esta reserva'
            });
        }

        res.json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la reserva',
            error: error.message
        });
    }
};

/**
 * Update reservation status
 */
export const updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const reservation = await Reservation.findByPk(id, {
            include: [{ model: Product }]
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        const oldStatus = reservation.status;

        // Update reservation
        await reservation.update({ status });

        // If completing, deduct actual stock and release reserved
        if (status === 'Completada' && oldStatus !== 'Completada') {
            const newStock = reservation.Product.stock - reservation.quantity;
            const newReserved = Math.max(0, reservation.Product.reserved_stock - reservation.quantity);

            await reservation.Product.update({
                stock: newStock,
                reserved_stock: newReserved
            });

            // Create stock movement for sale/completion
            try {
                await StockMovement.create({
                    product_id: reservation.product_id,
                    movement_type: 'salida', // Or 'venta'
                    quantity: reservation.quantity,
                    previous_stock: reservation.Product.stock,
                    new_stock: newStock,
                    reason: 'Reserva completada',
                    performed_by: req.user.id,
                    reference_id: reservation.id,
                    reference_type: 'reservation'
                });
            } catch (err) {
                console.error('Error creating stock movement for completion:', err);
            }
        }
        // If canceling or expiring, release reserved stock
        else if ((status === 'Cancelada' || status === 'Expirada') &&
            (oldStatus === 'Pendiente' || oldStatus === 'Confirmada')) {
            await reservation.Product.update({
                reserved_stock: Math.max(0, reservation.Product.reserved_stock - reservation.quantity)
            });

            // Log cancellation movement
            try {
                await StockMovement.create({
                    product_id: reservation.product_id,
                    movement_type: 'cancelacion_reserva',
                    quantity: reservation.quantity,
                    previous_stock: reservation.Product.stock,
                    new_stock: reservation.Product.stock, // Stock doesn't change
                    reason: `Reserva ${status.toLowerCase()}`,
                    performed_by: req.user.id,
                    reference_id: reservation.id,
                    reference_type: 'reservation'
                });
            } catch (err) {
                console.error('Error creating stock movement for cancellation:', err);
            }
        }

        res.json({
            success: true,
            message: 'Estado de reserva actualizado',
            data: reservation
        });
    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado de la reserva',
            error: error.message
        });
    }
};

/**
 * Confirm reservation
 */
export const confirmReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findByPk(id, {
            include: [{ model: Product }]
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        if (reservation.status !== 'Pendiente') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden confirmar reservas pendientes'
            });
        }

        // Check if expired
        if (new Date() > new Date(reservation.expiry_date)) {
            await reservation.update({ status: 'Expirada' });
            await reservation.Product.update({
                reserved_stock: Math.max(0, reservation.Product.reserved_stock - reservation.quantity)
            });

            return res.status(400).json({
                success: false,
                message: 'La reserva ha expirado'
            });
        }

        await reservation.update({
            status: 'Confirmada',
            confirmed_by: req.user.id,
            confirmed_at: new Date()
        });

        const updatedReservation = await Reservation.findByPk(id, {
            include: [
                { model: Product },
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'confirmer', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        // Send confirmation notification
        try {
            await notificationService.notifyReservationConfirmed(
                reservation.user_id,
                reservation.id,
                updatedReservation.Product.name
            );
        } catch (notifError) {
            console.error('Error sending notification:', notifError);
        }

        res.json({
            success: true,
            message: 'Reserva confirmada exitosamente',
            data: updatedReservation
        });
    } catch (error) {
        console.error('Error confirming reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Error al confirmar la reserva',
            error: error.message
        });
    }
};

/**
 * Cancel reservation
 */
export const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role || req.user.Role?.name;

        const reservation = await Reservation.findByPk(id, {
            include: [{ model: Product }]
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Check permissions
        if (!['Admin', 'Gerente', 'Vendedor'].includes(userRole) &&
            reservation.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para cancelar esta reserva'
            });
        }

        if (reservation.status === 'Completada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar una reserva completada'
            });
        }

        // Release reserved stock
        if (reservation.status === 'Pendiente' || reservation.status === 'Confirmada') {
            await reservation.Product.update({
                reserved_stock: Math.max(0, reservation.Product.reserved_stock - reservation.quantity)
            });
        }

        await reservation.update({ status: 'Cancelada' });

        res.json({
            success: true,
            message: 'Reserva cancelada exitosamente',
            data: reservation
        });
    } catch (error) {
        console.error('Error canceling reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la reserva',
            error: error.message
        });
    }
};

/**
 * Get reservation confirmation details
 */
export const getReservationConfirmation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findByPk(id, {
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image_url'] },
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        // Check if user owns this reservation
        if (reservation.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver esta confirmación'
            });
        }

        res.json({
            success: true,
            data: {
                reservation,
                confirmation_code: reservation.id.substring(0, 8).toUpperCase(),
                expires_at: reservation.expiry_date,
                is_confirmed: reservation.status === 'Confirmada'
            }
        });
    } catch (error) {
        console.error('Error fetching reservation confirmation:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la confirmación',
            error: error.message
        });
    }
};

export default {
    createReservation,
    getReservations,
    getMyReservations,
    getReservationById,
    updateReservationStatus,
    confirmReservation,
    cancelReservation,
    getReservationConfirmation
};
