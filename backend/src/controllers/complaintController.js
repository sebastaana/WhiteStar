import { Complaint, User, Order } from '../models/index.js';

/**
 * Create a new complaint
 */
export const createComplaint = async (req, res) => {
    try {
        const { order_id, subject, description, category, priority } = req.body;
        const user_id = req.user.id;

        // Validate order if provided
        if (order_id) {
            const order = await Order.findByPk(order_id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }
        }

        const complaint = await Complaint.create({
            user_id,
            order_id: order_id || null,
            subject,
            description,
            category: category || 'Otro',
            priority: priority || 'Media',
            status: 'Abierto'
        });

        const completeComplaint = await Complaint.findByPk(complaint.id, {
            include: [
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: Order, required: false }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Reclamo registrado exitosamente',
            data: completeComplaint
        });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el reclamo',
            error: error.message
        });
    }
};

/**
 * Get all complaints
 */
export const getComplaints = async (req, res) => {
    try {
        const { status, priority, assigned_to, user_id, page = 1, limit = 20 } = req.query;
        const userRole = req.user.role || req.user.Role?.name;

        const where = {};

        // If not admin/manager/customer service, only show own complaints
        if (!['Admin', 'Gerente', 'Atención al Cliente'].includes(userRole)) {
            where.user_id = req.user.id;
        } else {
            if (user_id) where.user_id = user_id;
            if (assigned_to) where.assigned_to = assigned_to;
        }

        if (status) where.status = status;
        if (priority) where.priority = priority;

        const offset = (page - 1) * limit;

        const { count, rows: complaints } = await Complaint.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ],
            include: [
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'], required: false },
                { model: Order, required: false }
            ]
        });

        res.json({
            success: true,
            data: complaints,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los reclamos',
            error: error.message
        });
    }
};

/**
 * Get user's own complaints
 */
export const getMyComplaints = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = { user_id: req.user.id };

        if (status) where.status = status;

        const offset = (page - 1) * limit;

        const { count, rows: complaints } = await Complaint.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'], required: false },
                { model: Order, required: false }
            ]
        });

        res.json({
            success: true,
            data: complaints,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching my complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tus reclamos',
            error: error.message
        });
    }
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role || req.user.Role?.name;

        const complaint = await Complaint.findByPk(id, {
            include: [
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'], required: false },
                { model: Order, required: false }
            ]
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Reclamo no encontrado'
            });
        }

        // Check permissions
        if (!['Admin', 'Gerente', 'Atención al Cliente'].includes(userRole) &&
            complaint.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver este reclamo'
            });
        }

        res.json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el reclamo',
            error: error.message
        });
    }
};

/**
 * Update complaint
 */
export const updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const complaint = await Complaint.findByPk(id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Reclamo no encontrado'
            });
        }

        await complaint.update(updateData);

        const updatedComplaint = await Complaint.findByPk(id, {
            include: [
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'], required: false }
            ]
        });

        res.json({
            success: true,
            message: 'Reclamo actualizado exitosamente',
            data: updatedComplaint
        });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el reclamo',
            error: error.message
        });
    }
};

/**
 * Assign complaint to user
 */
export const assignComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigned_to } = req.body;

        const complaint = await Complaint.findByPk(id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Reclamo no encontrado'
            });
        }

        // Verify assignee exists
        const assignee = await User.findByPk(assigned_to);
        if (!assignee) {
            return res.status(404).json({
                success: false,
                message: 'Usuario asignado no encontrado'
            });
        }

        await complaint.update({
            assigned_to,
            status: complaint.status === 'Abierto' ? 'En Proceso' : complaint.status
        });

        const updatedComplaint = await Complaint.findByPk(id, {
            include: [
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        res.json({
            success: true,
            message: 'Reclamo asignado exitosamente',
            data: updatedComplaint
        });
    } catch (error) {
        console.error('Error assigning complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Error al asignar el reclamo',
            error: error.message
        });
    }
};

/**
 * Resolve complaint
 */
export const resolveComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution_notes } = req.body;

        const complaint = await Complaint.findByPk(id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Reclamo no encontrado'
            });
        }

        await complaint.update({
            status: 'Resuelto',
            resolution_notes,
            resolved_at: new Date()
        });

        const resolvedComplaint = await Complaint.findByPk(id, {
            include: [
                { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        res.json({
            success: true,
            message: 'Reclamo resuelto exitosamente',
            data: resolvedComplaint
        });
    } catch (error) {
        console.error('Error resolving complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Error al resolver el reclamo',
            error: error.message
        });
    }
};

export default {
    createComplaint,
    getComplaints,
    getMyComplaints,
    getComplaintById,
    updateComplaint,
    assignComplaint,
    resolveComplaint
};
