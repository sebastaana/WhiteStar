import { Task, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get all tasks with filters
 */
export const getTasks = async (req, res) => {
    try {
        const { status, priority, assigned_to, created_by, page = 1, limit = 50 } = req.query;
        const userRole = req.user.role || req.user.Role?.name;

        const where = {};

        // Filters
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assigned_to) where.assigned_to = assigned_to;
        if (created_by) where.created_by = created_by;

        // If not admin/manager, only show tasks assigned to or created by user
        if (!['Admin', 'Gerente'].includes(userRole)) {
            where[Op.or] = [
                { assigned_to: req.user.id },
                { created_by: req.user.id }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows: tasks } = await Task.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [
                ['due_date', 'ASC'],
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ],
            include: [
                { model: User, as: 'assignedTo', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'createdBy', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        res.json({
            success: true,
            tasks,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las tareas',
            error: error.message
        });
    }
};

/**
 * Get task by ID
 */
export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role || req.user.Role?.name;

        const task = await Task.findByPk(id, {
            include: [
                { model: User, as: 'assignedTo', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'createdBy', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        // Check permissions
        if (!['Admin', 'Gerente'].includes(userRole) &&
            task.assigned_to !== req.user.id &&
            task.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver esta tarea'
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la tarea',
            error: error.message
        });
    }
};

/**
 * Create new task
 */
export const createTask = async (req, res) => {
    try {
        const { title, description, assigned_to, due_date, priority, status } = req.body;

        // Validation
        if (!title || !assigned_to || !due_date) {
            return res.status(400).json({
                success: false,
                message: 'Título, usuario asignado y fecha de vencimiento son requeridos'
            });
        }

        const task = await Task.create({
            title,
            description,
            assigned_to,
            due_date,
            priority: priority || 'media',
            status: status || 'pendiente',
            created_by: req.user.id
        });

        const completeTask = await Task.findByPk(task.id, {
            include: [
                { model: User, as: 'assignedTo', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'createdBy', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Tarea creada exitosamente',
            task: completeTask
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la tarea',
            error: error.message
        });
    }
};

/**
 * Update task
 */
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, assigned_to, due_date, priority, status } = req.body;
        const userRole = req.user.role || req.user.Role?.name;

        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        // Check permissions - only admin/manager or creator can edit
        if (!['Admin', 'Gerente'].includes(userRole) && task.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para editar esta tarea'
            });
        }

        await task.update({
            title: title || task.title,
            description: description !== undefined ? description : task.description,
            assigned_to: assigned_to || task.assigned_to,
            due_date: due_date || task.due_date,
            priority: priority || task.priority,
            status: status || task.status
        });

        const updatedTask = await Task.findByPk(id, {
            include: [
                { model: User, as: 'assignedTo', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: User, as: 'createdBy', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        res.json({
            success: true,
            message: 'Tarea actualizada exitosamente',
            task: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la tarea',
            error: error.message
        });
    }
};

/**
 * Delete task
 */
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role || req.user.Role?.name;

        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        // Check permissions - only admin/manager or creator can delete
        if (!['Admin', 'Gerente'].includes(userRole) && task.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar esta tarea'
            });
        }

        await task.destroy();

        res.json({
            success: true,
            message: 'Tarea eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la tarea',
            error: error.message
        });
    }
};

/**
 * Get my tasks (assigned to me)
 */
export const getMyTasks = async (req, res) => {
    try {
        const { status, priority } = req.query;

        const where = {
            assigned_to: req.user.id
        };

        if (status) where.status = status;
        if (priority) where.priority = priority;

        const tasks = await Task.findAll({
            where,
            order: [
                ['due_date', 'ASC'],
                ['priority', 'DESC']
            ],
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        res.json({
            success: true,
            tasks
        });
    } catch (error) {
        console.error('Error fetching my tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tus tareas',
            error: error.message
        });
    }
};

export default {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getMyTasks
};
