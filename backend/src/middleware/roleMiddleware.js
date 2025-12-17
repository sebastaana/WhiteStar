// Role constants
export const ROLES = {
    CLIENTE: 'Cliente',
    VENDEDOR: 'Vendedor',
    ADMIN_STOCK: 'Administrador de Stock',
    ATENCION_CLIENTE: 'Atención al Cliente',
    GERENTE: 'Gerente',
    ADMIN: 'Admin'
};

// Permission groups
export const PERMISSIONS = {
    // Product management
    CREATE_PRODUCT: [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE],
    UPDATE_PRODUCT: [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE],
    DELETE_PRODUCT: [ROLES.ADMIN, ROLES.GERENTE],
    VIEW_PRODUCTS: Object.values(ROLES),

    // Stock management
    VIEW_STOCK: [ROLES.VENDEDOR, ROLES.ADMIN_STOCK, ROLES.ADMIN, ROLES.GERENTE, ROLES.ATENCION_CLIENTE],
    UPDATE_STOCK: [ROLES.ADMIN_STOCK, ROLES.ADMIN, ROLES.GERENTE],
    VIEW_STOCK_ALERTS: [ROLES.ADMIN_STOCK, ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE],
    MANAGE_STOCK_MOVEMENTS: [ROLES.ADMIN_STOCK, ROLES.ADMIN, ROLES.GERENTE],

    // Reservations
    CREATE_RESERVATION: [ROLES.CLIENTE, ROLES.VENDEDOR, ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],
    VIEW_ALL_RESERVATIONS: [ROLES.VENDEDOR, ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],
    CONFIRM_RESERVATION: [ROLES.VENDEDOR, ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],

    // Promotions
    CREATE_PROMOTION: [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE],
    MANAGE_PROMOTIONS: [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE],

    // Complaints
    CREATE_COMPLAINT: Object.values(ROLES),
    VIEW_ALL_COMPLAINTS: [ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],
    ASSIGN_COMPLAINT: [ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],
    RESOLVE_COMPLAINT: [ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],

    // Orders
    CREATE_ORDER: Object.values(ROLES),
    VIEW_ALL_ORDERS: [ROLES.VENDEDOR, ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],
    GENERATE_TICKET: [ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE],

    // Reports
    VIEW_SALES_REPORTS: [ROLES.GERENTE, ROLES.ADMIN],
    VIEW_PERFORMANCE_REPORTS: [ROLES.GERENTE, ROLES.ADMIN],
    VIEW_INVENTORY_REPORTS: [ROLES.ADMIN_STOCK, ROLES.GERENTE, ROLES.ADMIN],

    // User management
    MANAGE_USERS: [ROLES.GERENTE, ROLES.ADMIN],
    MANAGE_PERMISSIONS: [ROLES.GERENTE, ROLES.ADMIN],

    // Customer service - Exclusive permissions
    VIEW_CUSTOMER_PROFILES: [ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],
    VIEW_CUSTOMER_HISTORY: [ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],
    MANAGE_COMPLAINTS: [ROLES.ATENCION_CLIENTE, ROLES.ADMIN, ROLES.GERENTE],
    UPDATE_ORDER_STATUS: [ROLES.ATENCION_CLIENTE, ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE],
    CONFIRM_RESERVATIONS: [ROLES.ATENCION_CLIENTE, ROLES.VENDEDOR, ROLES.ADMIN, ROLES.GERENTE]
};

/**
 * Middleware to check if user has required role
 * @param  {...string} allowedRoles - Array of allowed role names
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado - Acceso denegado'
            });
        }

        const userRole = req.user.role || req.user.Role?.name;

        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'Rol de usuario no encontrado'
            });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware to check if user has required permission
 * @param {string} permission - Permission key from PERMISSIONS object
 */
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado - Acceso denegado'
            });
        }

        const userRole = req.user.role || req.user.Role?.name;

        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'Rol de usuario no encontrado'
            });
        }

        const allowedRoles = PERMISSIONS[permission];

        if (!allowedRoles) {
            return res.status(500).json({
                success: false,
                message: 'Permiso no definido'
            });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }

        next();
    };
};

/**
 * Check if user has permission (utility function)
 * @param {object} user - User object
 * @param {string} permission - Permission key
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
    if (!user) return false;

    const userRole = user.role || user.Role?.name;
    if (!userRole) return false;

    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) return false;

    return allowedRoles.includes(userRole);
};

/**
 * Check if user is owner of resource or has admin privileges
 */
export const requireOwnerOrAdmin = (userIdField = 'user_id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado - Acceso denegado'
            });
        }

        const userRole = req.user.role || req.user.Role?.name;
        const isAdmin = [ROLES.ADMIN, ROLES.GERENTE].includes(userRole);

        // If admin, allow access
        if (isAdmin) {
            return next();
        }

        // Check if user is owner
        const resourceUserId = req.body[userIdField] || req.params[userIdField];
        if (resourceUserId && resourceUserId === req.user.id) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a este recurso'
        });
    };
};

export default {
    ROLES,
    PERMISSIONS,
    requireRole,
    requirePermission,
    hasPermission,
    requireOwnerOrAdmin
};
