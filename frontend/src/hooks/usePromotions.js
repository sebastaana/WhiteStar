import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook para obtener y aplicar promociones activas
 */
export const usePromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivePromotions();
    }, []);

    const fetchActivePromotions = async () => {
        try {
            const response = await api.get('/promotions/active');
            setPromotions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Calcula el descuento aplicable para un producto
     */
    const calculateDiscount = (product, quantity = 1) => {
        if (!product || !promotions.length) {
            return {
                hasDiscount: false,
                originalPrice: parseFloat(product?.price || 0),
                discount: 0,
                finalPrice: parseFloat(product?.price || 0),
                promotion: null
            };
        }

        const originalPrice = parseFloat(product.price);
        const subtotal = originalPrice * quantity;
        let bestDiscount = 0;
        let bestPromotion = null;

        // Buscar la mejor promoción aplicable
        for (const promo of promotions) {
            // Verificar si aplica a este producto
            const appliesDirectly = promo.product_id === product.id;
            const appliesByCategory = promo.category_id === product.category_id;

            if (!appliesDirectly && !appliesByCategory) continue;

            // Verificar límite de uso
            if (promo.usage_limit && promo.usage_count >= promo.usage_limit) continue;

            // Verificar compra mínima
            if (promo.min_purchase_amount && subtotal < parseFloat(promo.min_purchase_amount)) continue;

            // Calcular descuento
            let discount = 0;
            if (promo.discount_type === 'percentage') {
                discount = (subtotal * parseFloat(promo.discount_value)) / 100;
            } else {
                discount = parseFloat(promo.discount_value);
            }

            // Aplicar límite máximo de descuento
            if (promo.max_discount_amount) {
                discount = Math.min(discount, parseFloat(promo.max_discount_amount));
            }

            // Guardar el mejor descuento
            if (discount > bestDiscount) {
                bestDiscount = discount;
                bestPromotion = promo;
            }
        }

        if (bestDiscount > 0) {
            const finalPrice = Math.max(0, subtotal - bestDiscount);
            return {
                hasDiscount: true,
                originalPrice,
                discount: bestDiscount,
                finalPrice,
                discountPercentage: ((bestDiscount / subtotal) * 100).toFixed(0),
                promotion: bestPromotion
            };
        }

        return {
            hasDiscount: false,
            originalPrice,
            discount: 0,
            finalPrice: subtotal,
            promotion: null
        };
    };

    /**
     * Calcula descuentos para múltiples productos (carrito)
     */
    const calculateCartDiscounts = (cartItems) => {
        let totalDiscount = 0;
        const itemsWithDiscounts = cartItems.map(item => {
            const result = calculateDiscount(item.product || item, item.quantity);
            totalDiscount += result.discount;
            return {
                ...item,
                ...result
            };
        });

        return {
            items: itemsWithDiscounts,
            totalDiscount
        };
    };

    return {
        promotions,
        loading,
        calculateDiscount,
        calculateCartDiscounts,
        refresh: fetchActivePromotions
    };
};
