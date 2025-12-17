import { User, Order, OrderItem, Product, Reservation, Complaint, Category, Role } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Search customers by name, email, or phone
 */
export const searchCustomers = async (req, res) => {
    try {
        const { query } = req.query;

        let whereClause = {};

        if (query && query.length >= 2) {
            whereClause = {
                [Op.or]: [
                    { first_name: { [Op.like]: `%${query}%` } },
                    { last_name: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } }
                ]
            };
        } else if (query && query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'La búsqueda debe tener al menos 2 caracteres'
            });
        }

        const customers = await User.findAll({
            where: whereClause,
            attributes: ['id', 'first_name', 'last_name', 'email', 'created_at'],
            include: [{
                model: Role,
                attributes: ['name']
            }],
            limit: 20,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('Error searching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar clientes',
            error: error.message
        });
    }
};

/**
 * Get complete customer profile with history
 */
export const getCustomerProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Get customer basic info
        const customer = await User.findByPk(id, {
            attributes: ['id', 'first_name', 'last_name', 'email', 'created_at'],
            include: [{
                model: Role,
                attributes: ['name']
            }]
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Get orders history
        const orders = await Order.findAll({
            where: { user_id: id },
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    attributes: ['name', 'price', 'image_url']
                }]
            }],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        // Get reservations history
        const reservations = await Reservation.findAll({
            where: { user_id: id },
            include: [{
                model: Product,
                attributes: ['name', 'price', 'image_url']
            }],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        // Get complaints
        const complaints = await Complaint.findAll({
            where: { user_id: id },
            include: [{
                model: Order,
                attributes: ['id', 'total', 'status']
            }, {
                model: User,
                as: 'assignee',
                attributes: ['first_name', 'last_name']
            }],
            order: [['created_at', 'DESC']]
        });

        // Calculate statistics
        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
        const totalOrders = orders.length;
        const totalReservations = reservations.length;
        const totalComplaints = complaints.length;

        res.json({
            success: true,
            data: {
                customer,
                statistics: {
                    total_spent: totalSpent,
                    total_orders: totalOrders,
                    total_reservations: totalReservations,
                    total_complaints: totalComplaints
                },
                orders,
                reservations,
                complaints
            }
        });
    } catch (error) {
        console.error('Error getting customer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil del cliente',
            error: error.message
        });
    }
};

/**
 * Search orders
 */
export const searchOrders = async (req, res) => {
    try {
        const { query, status } = req.query;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        if (query) {
            whereClause.id = { [Op.like]: `%${query}%` };
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['first_name', 'last_name', 'email']
            }, {
                model: OrderItem,
                include: [{
                    model: Product,
                    attributes: ['name', 'price']
                }]
            }],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error searching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar órdenes',
            error: error.message
        });
    }
};

/**
 * Search reservations
 */
export const searchReservations = async (req, res) => {
    try {
        const { query, status } = req.query;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'customer',
                attributes: ['first_name', 'last_name', 'email'],
                where: query ? {
                    [Op.or]: [
                        { first_name: { [Op.like]: `%${query}%` } },
                        { last_name: { [Op.like]: `%${query}%` } },
                        { email: { [Op.like]: `%${query}%` } }
                    ]
                } : {}
            }, {
                model: Product,
                attributes: ['name', 'price', 'image_url']
            }],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            data: reservations
        });
    } catch (error) {
        console.error('Error searching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar reservas',
            error: error.message
        });
    }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido'
            });
        }

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: 'Estado de orden actualizado',
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado de orden',
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

        const reservation = await Reservation.findByPk(id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        reservation.status = 'Confirmada';
        reservation.confirmed_by = req.user.id;
        reservation.confirmed_at = new Date();
        await reservation.save();

        res.json({
            success: true,
            message: 'Reserva confirmada',
            data: reservation
        });
    } catch (error) {
        console.error('Error confirming reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Error al confirmar reserva',
            error: error.message
        });
    }
};

export default {
    searchCustomers,
    getCustomerProfile,
    searchOrders,
    searchReservations,
    updateOrderStatus,
    confirmReservation
};
