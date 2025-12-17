import { Promotion, Product, Category, User, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Create a new promotion
 */
export const createPromotion = async (req, res) => {
    try {
        const {
            name,
            description,
            discount_type,
            discount_value,
            start_date,
            end_date,
            product_id,
            category_id,
            min_purchase_amount,
            max_discount_amount,
            usage_limit
        } = req.body;

        // Validate dates
        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
        }

        // Validate discount value
        if (discount_type === 'percentage' && (discount_value < 0 || discount_value > 100)) {
            return res.status(400).json({
                success: false,
                message: 'El descuento porcentual debe estar entre 0 y 100'
            });
        }

        const promotion = await Promotion.create({
            name,
            description,
            discount_type,
            discount_value,
            start_date,
            end_date,
            product_id: product_id || null,
            category_id: category_id || null,
            min_purchase_amount: min_purchase_amount || 0,
            max_discount_amount: max_discount_amount || null,
            usage_limit: usage_limit || null,
            created_by: req.user.id,
            is_active: true
        });

        const completePromotion = await Promotion.findByPk(promotion.id, {
            include: [
                { model: Product, attributes: ['id', 'name', 'price'], required: false },
                { model: Category, attributes: ['id', 'name'], required: false },
                { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Promoción creada exitosamente',
            data: completePromotion
        });
    } catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la promoción',
            error: error.message
        });
    }
};

/**
 * Get all promotions
 */
export const getPromotions = async (req, res) => {
    try {
        const { is_active, product_id, category_id, page = 1, limit = 20 } = req.query;
        const where = {};

        if (is_active !== undefined) where.is_active = is_active === 'true';
        if (product_id) where.product_id = product_id;
        if (category_id) where.category_id = category_id;

        const offset = (page - 1) * limit;

        const { count, rows: promotions } = await Promotion.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image_url'], required: false },
                { model: Category, attributes: ['id', 'name'], required: false },
                { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        res.json({
            success: true,
            data: promotions,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las promociones',
            error: error.message
        });
    }
};

/**
 * Get active promotions (public)
 */
export const getActivePromotions = async (req, res) => {
    try {
        const now = new Date();

        const promotions = await Promotion.findAll({
            where: {
                is_active: true,
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now },
                [Op.or]: [
                    { usage_limit: null },
                    { usage_count: { [Op.lt]: sequelize.col('usage_limit') } }
                ]
            },
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image_url'], required: false },
                { model: Category, attributes: ['id', 'name'], required: false }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: promotions
        });
    } catch (error) {
        console.error('Error fetching active promotions:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las promociones activas',
            error: error.message
        });
    }
};

/**
 * Get promotion by ID
 */
export const getPromotionById = async (req, res) => {
    try {
        const { id } = req.params;

        const promotion = await Promotion.findByPk(id, {
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image_url'], required: false },
                { model: Category, attributes: ['id', 'name'], required: false },
                { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }
            ]
        });

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promoción no encontrada'
            });
        }

        res.json({
            success: true,
            data: promotion
        });
    } catch (error) {
        console.error('Error fetching promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la promoción',
            error: error.message
        });
    }
};

/**
 * Update promotion
 */
export const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const promotion = await Promotion.findByPk(id);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promoción no encontrada'
            });
        }

        // Validate dates if provided
        const startDate = updateData.start_date || promotion.start_date;
        const endDate = updateData.end_date || promotion.end_date;

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
        }

        await promotion.update(updateData);

        const updatedPromotion = await Promotion.findByPk(id, {
            include: [
                { model: Product, attributes: ['id', 'name', 'price'], required: false },
                { model: Category, attributes: ['id', 'name'], required: false }
            ]
        });

        res.json({
            success: true,
            message: 'Promoción actualizada exitosamente',
            data: updatedPromotion
        });
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la promoción',
            error: error.message
        });
    }
};

/**
 * Delete (deactivate) promotion
 */
export const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;

        const promotion = await Promotion.findByPk(id);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promoción no encontrada'
            });
        }

        await promotion.update({ is_active: false });

        res.json({
            success: true,
            message: 'Promoción desactivada exitosamente'
        });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la promoción',
            error: error.message
        });
    }
};

/**
 * Calculate discounted price for a product
 */
export const applyPromotion = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const now = new Date();
        const originalPrice = parseFloat(product.price);
        const subtotal = originalPrice * quantity;

        // Find applicable promotions
        const promotions = await Promotion.findAll({
            where: {
                is_active: true,
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now },
                [Op.or]: [
                    { product_id: product_id },
                    { category_id: product.category_id }
                ]
            },
            order: [['discount_value', 'DESC']]
        });

        let bestDiscount = 0;
        let appliedPromotion = null;

        for (const promo of promotions) {
            // Check usage limit
            if (promo.usage_limit && promo.usage_count >= promo.usage_limit) continue;

            // Check minimum purchase
            if (promo.min_purchase_amount && subtotal < promo.min_purchase_amount) continue;

            let discount = 0;
            if (promo.discount_type === 'percentage') {
                discount = (subtotal * promo.discount_value) / 100;
            } else {
                discount = parseFloat(promo.discount_value);
            }

            // Apply max discount limit
            if (promo.max_discount_amount) {
                discount = Math.min(discount, parseFloat(promo.max_discount_amount));
            }

            if (discount > bestDiscount) {
                bestDiscount = discount;
                appliedPromotion = promo;
            }
        }

        const finalPrice = Math.max(0, subtotal - bestDiscount);

        res.json({
            success: true,
            data: {
                original_price: originalPrice,
                quantity,
                subtotal,
                discount: bestDiscount,
                final_price: finalPrice,
                promotion: appliedPromotion ? {
                    id: appliedPromotion.id,
                    name: appliedPromotion.name,
                    discount_type: appliedPromotion.discount_type,
                    discount_value: appliedPromotion.discount_value
                } : null
            }
        });
    } catch (error) {
        console.error('Error applying promotion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aplicar la promoción',
            error: error.message
        });
    }
};

export default {
    createPromotion,
    getPromotions,
    getActivePromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    applyPromotion
};
