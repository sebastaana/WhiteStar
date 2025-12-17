import { Product, StockAlert, StockMovement, User, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Update product stock
 */
export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, reason, movement_type = 'ajuste' } = req.body;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const previousStock = product.stock;
        const newStock = previousStock + quantity;

        if (newStock < 0) {
            return res.status(400).json({
                success: false,
                message: 'El stock no puede ser negativo'
            });
        }

        await product.update({ stock: newStock });
        await StockMovement.create({
            product_id: productId,
            movement_type,
            quantity: Math.abs(quantity),
            previous_stock: previousStock,
            new_stock: newStock,
            reason,
            performed_by: req.user.id,
            reference_type: 'manual'
        });

        if (newStock <= product.low_stock_threshold) {
            await createStockAlertIfNeeded(product);
        }

        res.json({
            success: true,
            message: 'Stock actualizado exitosamente',
            data: {
                product_id: productId,
                previous_stock: previousStock,
                new_stock: newStock,
                change: quantity
            }
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el stock',
            error: error.message
        });
    }
};

/**
 * Get stock alerts
 */
export const getStockAlerts = async (req, res) => {
    try {
        const { is_active = true, acknowledged, page = 1, limit = 50 } = req.query;
        const where = {};

        if (is_active !== undefined) where.is_active = is_active === 'true';
        if (acknowledged !== undefined) {
            where.acknowledged_by = acknowledged === 'true' ? { [Op.ne]: null } : null;
        }

        const offset = (page - 1) * limit;

        const { count, rows: alerts } = await StockAlert.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [
                ['severity', 'DESC'],
                ['created_at', 'DESC']
            ],
            include: [
                { model: Product, attributes: ['id', 'name', 'stock', 'low_stock_threshold', 'image_url'] },
                { model: User, as: 'acknowledger', attributes: ['id', 'first_name', 'last_name'], required: false }
            ]
        });

        res.json({
            success: true,
            data: alerts,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching stock alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las alertas de stock',
            error: error.message
        });
    }
};

/**
 * Acknowledge stock alert
 */
export const acknowledgeAlert = async (req, res) => {
    try {
        const { id } = req.params;

        const alert = await StockAlert.findByPk(id);
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alerta no encontrada'
            });
        }

        await alert.update({
            acknowledged_by: req.user.id,
            acknowledged_at: new Date()
        });

        const updatedAlert = await StockAlert.findByPk(id, {
            include: [
                { model: Product, attributes: ['id', 'name', 'stock'] },
                { model: User, as: 'acknowledger', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        res.json({
            success: true,
            message: 'Alerta reconocida exitosamente',
            data: updatedAlert
        });
    } catch (error) {
        console.error('Error acknowledging alert:', error);
        res.status(500).json({
            success: false,
            message: 'Error al reconocer la alerta',
            error: error.message
        });
    }
};

/**
 * Get stock movements
 */
export const getStockMovements = async (req, res) => {
    try {
        const { product_id, movement_type, start_date, end_date, page = 1, limit = 50 } = req.query;
        const where = {};

        if (product_id) where.product_id = product_id;
        if (movement_type) where.movement_type = movement_type;

        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) where.created_at[Op.gte] = new Date(start_date);
            if (end_date) where.created_at[Op.lte] = new Date(end_date);
        }

        const offset = (page - 1) * limit;

        const { count, rows: movements } = await StockMovement.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            include: [
                { model: Product, attributes: ['id', 'name', 'image_url'] },
                { model: User, as: 'performer', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        res.json({
            success: true,
            data: movements,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching stock movements:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los movimientos de stock',
            error: error.message
        });
    }
};

/**
 * Create manual stock movement
 */
export const createStockMovement = async (req, res) => {
    try {
        const { product_id, movement_type, quantity, reason, notes } = req.body;

        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const previousStock = product.stock;
        let stockChange = 0;

        switch (movement_type) {
            case 'entrada':
                stockChange = quantity;
                break;
            case 'salida':
                stockChange = -quantity;
                break;
            case 'ajuste':
                stockChange = quantity;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de movimiento inválido'
                });
        }

        const newStock = previousStock + stockChange;

        if (newStock < 0) {
            return res.status(400).json({
                success: false,
                message: 'El stock resultante no puede ser negativo'
            });
        }

        await product.update({ stock: newStock });

        const movement = await StockMovement.create({
            product_id,
            movement_type,
            quantity,
            previous_stock: previousStock,
            new_stock: newStock,
            reason,
            notes,
            performed_by: req.user.id,
            reference_type: 'manual'
        });

        if (newStock <= product.low_stock_threshold) {
            await createStockAlertIfNeeded(product);
        }

        const completeMovement = await StockMovement.findByPk(movement.id, {
            include: [
                { model: Product, attributes: ['id', 'name'] },
                { model: User, as: 'performer', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Movimiento de stock registrado exitosamente',
            data: completeMovement
        });
    } catch (error) {
        console.error('Error creating stock movement:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el movimiento de stock',
            error: error.message
        });
    }
};

/**
 * Get stock report
 */
export const getStockReport = async (req, res) => {
    try {
        const { category_id, low_stock_only } = req.query;
        const where = {};

        if (category_id) where.category_id = category_id;

        const products = await Product.findAll({
            where,
            attributes: ['id', 'name', 'stock', 'reserved_stock', 'low_stock_threshold', 'price'],
            order: [['stock', 'ASC']]
        });

        const report = products.map(product => {
            const availableStock = product.stock - product.reserved_stock;
            const isLowStock = product.stock <= product.low_stock_threshold;
            const stockValue = product.stock * parseFloat(product.price);

            return {
                id: product.id,
                name: product.name,
                stock: product.stock,
                reserved_stock: product.reserved_stock,
                available_stock: availableStock,
                low_stock_threshold: product.low_stock_threshold,
                is_low_stock: isLowStock,
                stock_value: stockValue,
                price: product.price
            };
        });

        const filteredReport = low_stock_only === 'true'
            ? report.filter(item => item.is_low_stock)
            : report;

        const summary = {
            total_products: filteredReport.length,
            low_stock_products: filteredReport.filter(item => item.is_low_stock).length,
            total_stock_value: filteredReport.reduce((sum, item) => sum + item.stock_value, 0),
            total_units: filteredReport.reduce((sum, item) => sum + item.stock, 0)
        };

        res.json({
            success: true,
            data: {
                products: filteredReport,
                summary
            }
        });
    } catch (error) {
        console.error('Error generating stock report:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte de stock',
            error: error.message
        });
    }
};

/**
 * Bulk update stock
 */
export const bulkUpdateStock = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de actualizaciones'
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const { product_id, quantity, reason } = update;

                const product = await Product.findByPk(product_id);
                if (!product) {
                    errors.push({ product_id, error: 'Producto no encontrado' });
                    continue;
                }

                const previousStock = product.stock;
                const newStock = previousStock + quantity;

                if (newStock < 0) {
                    errors.push({ product_id, error: 'Stock resultante negativo' });
                    continue;
                }

                await product.update({ stock: newStock });

                await StockMovement.create({
                    product_id,
                    movement_type: 'ajuste',
                    quantity: Math.abs(quantity),
                    previous_stock: previousStock,
                    new_stock: newStock,
                    reason,
                    performed_by: req.user.id,
                    reference_type: 'manual',
                    notes: 'Actualización masiva'
                });

                if (newStock <= product.low_stock_threshold) {
                    await createStockAlertIfNeeded(product);
                }

                results.push({
                    product_id,
                    previous_stock: previousStock,
                    new_stock: newStock,
                    success: true
                });
            } catch (error) {
                errors.push({ product_id: update.product_id, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Actualización masiva completada. ${results.length} exitosas, ${errors.length} fallidas`,
            data: {
                successful: results,
                failed: errors
            }
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({
            success: false,
            message: 'Error en la actualización masiva',
            error: error.message
        });
    }
};

/**
 * Helper function to create stock alert if needed
 */
async function createStockAlertIfNeeded(product) {
    try {
        const existingAlert = await StockAlert.findOne({
            where: {
                product_id: product.id,
                is_active: true
            }
        });

        if (existingAlert) {
            await existingAlert.update({
                current_stock: product.stock,
                alert_sent: true
            });
        } else {
            let severity = 'Medium';
            const stockPercentage = (product.stock / product.low_stock_threshold) * 100;

            if (stockPercentage <= 25) severity = 'Critical';
            else if (stockPercentage <= 50) severity = 'High';
            else if (stockPercentage <= 75) severity = 'Medium';
            else severity = 'Low';

            await StockAlert.create({
                product_id: product.id,
                threshold: product.low_stock_threshold,
                current_stock: product.stock,
                severity,
                is_active: true,
                alert_sent: true
            });
        }
    } catch (error) {
        console.error('Error creating stock alert:', error);
    }
}

/**
 * Get stock consumption patterns
 */
export const getStockPatterns = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const where = {
            movement_type: 'salida'
        };

        if (start_date || end_date) {
            where.created_at = {};
            if (start_date) where.created_at[Op.gte] = new Date(start_date);
            if (end_date) where.created_at[Op.lte] = new Date(end_date);
        }

        const movements = await StockMovement.findAll({
            where,
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
                [sequelize.fn('COUNT', sequelize.col('StockMovement.id')), 'movement_count']
            ],
            group: ['product_id'],
            order: [[sequelize.literal('total_quantity'), 'DESC']],
            limit: 10,
            include: [
                { model: Product, attributes: ['id', 'name', 'image_url', 'stock'] }
            ]
        });

        const patterns = movements.map(m => ({
            product_id: m.product_id,
            product_name: m.Product?.name,
            current_stock: m.Product?.stock,
            total_consumed: parseInt(m.getDataValue('total_quantity')),
            frequency: parseInt(m.getDataValue('movement_count'))
        }));

        res.json({
            success: true,
            data: patterns
        });
    } catch (error) {
        console.error('Error analyzing stock patterns:', error);
        res.status(500).json({
            success: false,
            message: 'Error al analizar patrones de stock',
            error: error.message
        });
    }
};

export default {
    updateStock,
    getStockAlerts,
    acknowledgeAlert,
    getStockMovements,
    createStockMovement,
    getStockReport,
    bulkUpdateStock,
    getStockPatterns
};
