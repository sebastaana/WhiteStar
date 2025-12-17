import { Order, OrderItem, Product, User, Reservation, StockMovement, Complaint, Category } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

/**
 * Get comprehensive sales report
 */
export const getSalesReport = async (req, res) => {
    try {
        const { start_date, end_date, group_by = 'day' } = req.query;

        const dateFilter = {};
        if (start_date) dateFilter[Op.gte] = new Date(start_date);
        if (end_date) dateFilter[Op.lte] = new Date(end_date);

        // Use reservation_date for filtering
        const whereClause = start_date || end_date ? { reservation_date: dateFilter } : {};

        // Total sales (from Reservations)
        const totalSales = await Reservation.findAll({
            where: whereClause,
            attributes: [
                [fn('COUNT', col('id')), 'total_orders'], // Keeping alias 'total_orders' for frontend compatibility
                [fn('SUM', col('total_price')), 'total_revenue'],
                [fn('AVG', col('total_price')), 'average_order_value']
            ],
            raw: true
        });

        // Sales by status
        const salesByStatus = await Reservation.findAll({
            where: whereClause,
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('total_price')), 'revenue']
            ],
            group: ['status'],
            raw: true
        });

        // Sales over time
        let dateFormat;
        switch (group_by) {
            case 'hour':
                dateFormat = '%Y-%m-%d %H:00:00';
                break;
            case 'day':
                dateFormat = '%Y-%m-%d';
                break;
            case 'week':
                dateFormat = '%Y-%u';
                break;
            case 'month':
                dateFormat = '%Y-%m';
                break;
            default:
                dateFormat = '%Y-%m-%d';
        }

        const salesOverTime = await Reservation.findAll({
            where: whereClause,
            attributes: [
                [fn('DATE_FORMAT', col('reservation_date'), dateFormat), 'period'],
                [fn('COUNT', col('id')), 'orders'],
                [fn('SUM', col('total_price')), 'revenue']
            ],
            group: [literal('period')],
            order: [[literal('period'), 'ASC']],
            raw: true
        });

        // Top selling products
        const topProducts = await Reservation.findAll({
            where: whereClause,
            attributes: [
                'product_id',
                [fn('SUM', col('quantity')), 'total_quantity'],
                [fn('SUM', col('total_price')), 'total_revenue']
            ],
            include: [{
                model: Product,
                attributes: ['name', 'price', 'image_url']
            }],
            group: ['product_id', 'Product.id', 'Product.name', 'Product.price', 'Product.image_url'],
            order: [[fn('SUM', col('quantity')), 'DESC']],
            limit: 10
        });

        // Sales by category
        let salesByCategory = [];
        try {
            // Get reservations with product and category data
            const reservationsWithCategory = await Reservation.findAll({
                where: whereClause,
                include: [{
                    model: Product,
                    attributes: ['id', 'name'],
                    include: [{
                        model: Category,
                        attributes: ['id', 'name']
                    }]
                }]
            });

            // Group by category manually for proper formatting
            const categoryMap = {};
            reservationsWithCategory.forEach(res => {
                const categoryName = res.Product?.Category?.name || 'Sin Categoría';
                if (!categoryMap[categoryName]) {
                    categoryMap[categoryName] = { total_quantity: 0, total_revenue: 0 };
                }
                categoryMap[categoryName].total_quantity += res.quantity || 0;
                categoryMap[categoryName].total_revenue += parseFloat(res.total_price) || 0;
            });

            // Convert to array format for frontend
            salesByCategory = Object.entries(categoryMap).map(([name, data]) => ({
                category_name: name,
                total_quantity: data.total_quantity,
                total_revenue: data.total_revenue
            }));
        } catch (err) {
            console.error('Error getting sales by category:', err);
        }


        // Payment status breakdown (Reservations don't strictly have payment_status separate from status, using status as proxy or skipping)
        // For now, we'll map status to payment_status structure to keep frontend happy if it uses it
        const paymentStatus = await Reservation.findAll({
            where: whereClause,
            attributes: [
                ['status', 'payment_status'], // Aliasing status as payment_status
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('total_price')), 'amount']
            ],
            group: ['status'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                summary: totalSales[0],
                sales_by_status: salesByStatus,
                sales_over_time: salesOverTime,
                top_products: topProducts,
                sales_by_category: salesByCategory,
                payment_status: paymentStatus,
                period: {
                    start: start_date || 'All time',
                    end: end_date || 'Now',
                    group_by
                }
            }
        });
    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de ventas',
            error: error.message
        });
    }
};

/**
 * Get inventory report
 */
export const getInventoryReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const dateFilter = {};
        if (start_date) dateFilter[Op.gte] = new Date(start_date);
        if (end_date) dateFilter[Op.lte] = new Date(end_date);

        // Current stock levels
        const stockLevels = await Product.findAll({
            attributes: ['id', 'name', 'stock', 'low_stock_threshold', 'price'],
            include: [{
                model: Category,
                attributes: ['name']
            }],
            order: [['stock', 'ASC']]
        });

        // Low stock products
        const lowStockProducts = await Product.findAll({
            attributes: ['id', 'name', 'stock', 'low_stock_threshold', 'price'],
            where: literal('stock <= low_stock_threshold'),
            include: [{
                model: Category,
                attributes: ['name']
            }]
        });

        // Stock movements
        const stockMovements = await StockMovement.findAll({
            where: start_date || end_date ? { created_at: dateFilter } : {},
            attributes: [
                'movement_type',
                [fn('COUNT', col('id')), 'total_movements'],
                [fn('SUM', col('quantity')), 'total_quantity']
            ],
            group: ['movement_type'],
            raw: true
        });

        // Stock value by category
        const stockValueByCategory = await Product.findAll({
            attributes: [
                [fn('SUM', literal('stock * price')), 'total_value'],
                [fn('SUM', col('stock')), 'total_units']
            ],
            include: [{
                model: Category,
                attributes: ['name']
            }],
            group: [col('Category.id'), col('Category.name')]
        });

        // Recent stock movements
        const recentMovements = await StockMovement.findAll({
            where: start_date || end_date ? { created_at: dateFilter } : {},
            include: [{
                model: Product,
                attributes: ['name']
            }, {
                model: User,
                as: 'performer',
                attributes: ['first_name', 'last_name']
            }],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        // Calculate summary metrics
        const totalProducts = stockLevels.length;
        const totalStockUnits = stockLevels.reduce((sum, p) => sum + (p.stock || 0), 0);
        const totalStockValue = stockLevels.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);
        const lowStockCount = lowStockProducts.length;

        // Format by_category data for the chart
        const byCategoryData = stockValueByCategory.map(item => ({
            category: item.Category?.name || 'Sin categoría',
            total_value: parseFloat(item.dataValues.total_value || 0),
            total_units: parseInt(item.dataValues.total_units || 0)
        }));

        res.json({
            success: true,
            data: {
                summary: {
                    total_products: totalProducts,
                    total_stock_units: totalStockUnits,
                    total_stock_value: totalStockValue,
                    low_stock_products: lowStockCount
                },
                by_category: byCategoryData,
                stock_levels: stockLevels,
                low_stock_products: lowStockProducts,
                stock_movements: stockMovements,
                recent_movements: recentMovements,
                period: {
                    start: start_date || 'All time',
                    end: end_date || 'Now'
                }
            }
        });
    } catch (error) {
        console.error('Error generating inventory report:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de inventario',
            error: error.message
        });
    }
};

/**
 * Get customer analytics report
 */
export const getCustomerReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const dateFilter = {};
        if (start_date) dateFilter[Op.gte] = new Date(start_date);
        if (end_date) dateFilter[Op.lte] = new Date(end_date);

        // Top customers by revenue
        const topCustomers = await Order.findAll({
            attributes: [
                [fn('COUNT', col('Order.id')), 'total_orders'],
                [fn('SUM', col('Order.total')), 'total_spent'],
                [fn('AVG', col('Order.total')), 'average_order']
            ],
            include: [{
                model: User,
                attributes: ['id', 'first_name', 'last_name', 'email'],
                required: true
            }],
            where: start_date || end_date ? { created_at: dateFilter } : {},
            group: ['User.id'],
            order: [[fn('SUM', col('Order.total')), 'DESC']],
            limit: 20
        });

        // Customer acquisition over time
        const newCustomers = await User.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'month'],
                [fn('COUNT', col('id')), 'new_customers']
            ],
            where: {
                role_id: { [Op.ne]: null },
                ...(start_date || end_date ? { created_at: dateFilter } : {})
            },
            group: [literal('month')],
            order: [[literal('month'), 'ASC']],
            raw: true
        });

        // Customer retention (repeat customers)
        const repeatCustomers = await Order.findAll({
            attributes: [
                'user_id',
                [fn('COUNT', col('id')), 'order_count']
            ],
            where: start_date || end_date ? { created_at: dateFilter } : {},
            group: ['user_id'],
            having: literal('order_count > 1'),
            raw: true
        });

        // Complaints by customer
        const complaintsStats = await Complaint.findAll({
            attributes: [
                'status',
                'priority',
                [fn('COUNT', col('id')), 'count']
            ],
            where: start_date || end_date ? { created_at: dateFilter } : {},
            group: ['status', 'priority'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                top_customers: topCustomers,
                new_customers_trend: newCustomers,
                repeat_customers_count: repeatCustomers.length,
                complaints_statistics: complaintsStats,
                period: {
                    start: start_date || 'All time',
                    end: end_date || 'Now'
                }
            }
        });
    } catch (error) {
        console.error('Error generating customer report:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de clientes',
            error: error.message
        });
    }
};

/**
 * Get dashboard summary (KPIs)
 */
export const getDashboardSummary = async (req, res) => {
    try {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Today's sales (from Reservations)
        const todaySales = await Reservation.sum('total_price', {
            where: {
                reservation_date: {
                    [Op.gte]: new Date(today.setHours(0, 0, 0, 0))
                }
            }
        });

        // This month's sales (from Reservations)
        const monthSales = await Reservation.sum('total_price', {
            where: {
                reservation_date: { [Op.gte]: lastMonth }
            }
        });

        // Active reservations
        const activeReservations = await Reservation.count({
            where: {
                status: { [Op.in]: ['Pendiente', 'Confirmada'] }
            }
        });

        // Low stock alerts
        const lowStockCount = await Product.count({
            where: literal('stock <= low_stock_threshold')
        });

        // Pending complaints
        const pendingComplaints = await Complaint.count({
            where: {
                status: { [Op.in]: ['Abierto', 'En Proceso'] }
            }
        });

        // Recent orders (using Reservations as "orders")
        const recentOrders = await Reservation.count({
            where: {
                reservation_date: { [Op.gte]: lastWeek }
            }
        });

        // Total customers
        const totalCustomers = await User.count();

        // Revenue trend (last 7 days, from Reservations)
        const revenueTrend = await Reservation.findAll({
            attributes: [
                [fn('DATE', col('reservation_date')), 'date'],
                [fn('SUM', col('total_price')), 'revenue'],
                [fn('COUNT', col('id')), 'orders']
            ],
            where: {
                reservation_date: { [Op.gte]: lastWeek }
            },
            group: [fn('DATE', col('reservation_date'))],
            order: [[fn('DATE', col('reservation_date')), 'ASC']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                kpis: {
                    today_sales: todaySales || 0,
                    month_sales: monthSales || 0,
                    active_reservations: activeReservations,
                    low_stock_alerts: lowStockCount,
                    pending_complaints: pendingComplaints,
                    recent_orders: recentOrders,
                    total_customers: totalCustomers
                },
                revenue_trend: revenueTrend
            }
        });
    } catch (error) {
        console.error('Error generating dashboard summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar resumen del dashboard',
            error: error.message
        });
    }
};

export default {
    getSalesReport,
    getInventoryReport,
    getCustomerReport,
    getDashboardSummary
};
