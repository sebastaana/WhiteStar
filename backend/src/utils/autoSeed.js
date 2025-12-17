import bcrypt from 'bcryptjs';
import { Role, User, Category, Product, Order, OrderItem, Reservation } from '../models/index.js';

const ROLES = {
    ADMIN: 'Admin',
    GERENTE: 'Gerente',
    VENDEDOR: 'Vendedor',
    ADMIN_STOCK: 'Administrador de Stock',
    ATENCION_CLIENTE: 'Atención al Cliente',
    CLIENTE: 'Cliente'
};

/**
 * Auto-seed the database if it's empty (no products exist)
 * Also seeds orders if products exist but orders don't
 * This runs automatically on server startup in production
 */
export async function autoSeedDatabase() {
    try {
        // Check if database already has products
        const existingProducts = await Product.count();
        const existingOrders = await Order.count();

        // If products exist but orders don't, just seed orders
        if (existingProducts > 0 && existingOrders === 0) {
            console.log('✓ Base de datos ya tiene productos, pero no tiene órdenes');
            console.log('📊 Creando órdenes de ejemplo para gráficos...');
            await seedOrders();
            return;
        }

        if (existingProducts > 0) {
            console.log('✓ Base de datos ya tiene productos y órdenes, omitiendo seed automático');
            return;
        }

        console.log('🌱 No hay productos en la base de datos. Iniciando auto-seed...\n');

        // 1. Create Roles (use findOrCreate to avoid duplicates)
        console.log('📝 Creando roles...');
        const roleResults = await Promise.all([
            Role.findOrCreate({ where: { name: ROLES.ADMIN }, defaults: { name: ROLES.ADMIN } }),
            Role.findOrCreate({ where: { name: ROLES.GERENTE }, defaults: { name: ROLES.GERENTE } }),
            Role.findOrCreate({ where: { name: ROLES.VENDEDOR }, defaults: { name: ROLES.VENDEDOR } }),
            Role.findOrCreate({ where: { name: ROLES.ADMIN_STOCK }, defaults: { name: ROLES.ADMIN_STOCK } }),
            Role.findOrCreate({ where: { name: ROLES.ATENCION_CLIENTE }, defaults: { name: ROLES.ATENCION_CLIENTE } }),
            Role.findOrCreate({ where: { name: ROLES.CLIENTE }, defaults: { name: ROLES.CLIENTE } })
        ]);

        const roles = roleResults.map(result => result[0]); // findOrCreate returns [instance, created]

        const roleMap = {};
        roles.forEach((role) => {
            roleMap[role.name] = role.id;
        });
        console.log('✅ Roles creados');

        // 2. Create Users (2 per role)
        console.log('👥 Creando usuarios de prueba...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const testUsers = [
            // Admins (2)
            { email: 'admin@whitestar.cl', password_hash: hashedPassword, first_name: 'Admin', last_name: 'Principal', role_id: roleMap[ROLES.ADMIN] },
            { email: 'admin2@whitestar.cl', password_hash: hashedPassword, first_name: 'Admin', last_name: 'Secundario', role_id: roleMap[ROLES.ADMIN] },
            // Gerentes (2)
            { email: 'gerente@whitestar.cl', password_hash: hashedPassword, first_name: 'Carlos', last_name: 'Rodríguez', role_id: roleMap[ROLES.GERENTE] },
            { email: 'gerente2@whitestar.cl', password_hash: hashedPassword, first_name: 'Laura', last_name: 'Mendoza', role_id: roleMap[ROLES.GERENTE] },
            // Vendedores (2)
            { email: 'vendedor@whitestar.cl', password_hash: hashedPassword, first_name: 'María', last_name: 'González', role_id: roleMap[ROLES.VENDEDOR] },
            { email: 'vendedor2@whitestar.cl', password_hash: hashedPassword, first_name: 'Juan', last_name: 'Pérez', role_id: roleMap[ROLES.VENDEDOR] },
            // Administradores de Stock (2)
            { email: 'stock@whitestar.cl', password_hash: hashedPassword, first_name: 'Pedro', last_name: 'Martínez', role_id: roleMap[ROLES.ADMIN_STOCK] },
            { email: 'stock2@whitestar.cl', password_hash: hashedPassword, first_name: 'Rosa', last_name: 'Castillo', role_id: roleMap[ROLES.ADMIN_STOCK] },
            // Atención al Cliente (2)
            { email: 'atencion@whitestar.cl', password_hash: hashedPassword, first_name: 'Ana', last_name: 'López', role_id: roleMap[ROLES.ATENCION_CLIENTE] },
            { email: 'atencion2@whitestar.cl', password_hash: hashedPassword, first_name: 'Luis', last_name: 'Fernández', role_id: roleMap[ROLES.ATENCION_CLIENTE] },
            // Clientes (2)
            { email: 'cliente@gmail.com', password_hash: hashedPassword, first_name: 'Sofia', last_name: 'Torres', role_id: roleMap[ROLES.CLIENTE] },
            { email: 'cliente2@gmail.com', password_hash: hashedPassword, first_name: 'Diego', last_name: 'Ramírez', role_id: roleMap[ROLES.CLIENTE] }
        ];

        await User.bulkCreate(testUsers);
        console.log('✅ Usuarios creados (2 por cada rol)');

        // 3. Create Categories
        console.log('📦 Creando categorías...');
        const categoriesData = [
            { name: 'Fragancias Femeninas', description: 'Perfumes elegantes para mujer' },
            { name: 'Fragancias Masculinas', description: 'Perfumes sofisticados para hombre' },
            { name: 'Fragancias Unisex', description: 'Perfumes versátiles para todos' },
            { name: 'Ediciones Limitadas', description: 'Colecciones exclusivas y especiales' }
        ];
        const categories = await Category.bulkCreate(categoriesData);
        console.log('✅ Categorías creadas');

        // 4. Create 12 Products
        console.log('🧴 Creando productos...');
        const productsData = [
            // Fragancias Masculinas (4)
            { name: 'Bleu de Chanel', description: 'Fragancia fresca y sofisticada con notas amaderadas. Ideal para el hombre moderno.', price: 89990, stock: 25, low_stock_threshold: 5, category_id: categories[1].id, image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop' },
            { name: 'Dior Sauvage', description: 'Fragancia icónica con notas de pimienta y ambroxan. Potente y magnético.', price: 79990, stock: 30, low_stock_threshold: 5, category_id: categories[1].id, image_url: 'https://images.unsplash.com/photo-1588405748390-9fbc4d9d7ffa?w=500&h=500&fit=crop' },
            { name: 'Creed Aventus', description: 'Fragancia de lujo con notas de piña y abedul. El perfume del éxito.', price: 149990, stock: 15, low_stock_threshold: 3, category_id: categories[1].id, image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' },
            { name: 'Versace Pour Homme', description: 'Fragancia mediterránea fresca con notas cítricas y ambar.', price: 59990, stock: 40, low_stock_threshold: 8, category_id: categories[1].id, image_url: 'https://images.unsplash.com/photo-1595425964272-fc617fa5e9be?w=500&h=500&fit=crop' },

            // Fragancias Femeninas (4)
            { name: 'Chanel No. 5', description: 'La fragancia más icónica del mundo. Elegancia atemporal.', price: 99990, stock: 20, low_stock_threshold: 4, category_id: categories[0].id, image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop' },
            { name: 'Miss Dior', description: 'Fragancia romántica y fresca con notas florales de rosa y peonía.', price: 84990, stock: 28, low_stock_threshold: 5, category_id: categories[0].id, image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=500&fit=crop' },
            { name: 'La Vie Est Belle', description: 'Fragancia dulce y adictiva con iris y praline. Celebra la vida.', price: 74990, stock: 35, low_stock_threshold: 7, category_id: categories[0].id, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop' },
            { name: 'Coco Mademoiselle', description: 'Fragancia oriental fresca con patchouli y naranja. Moderna y sensual.', price: 94990, stock: 22, low_stock_threshold: 4, category_id: categories[0].id, image_url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=500&h=500&fit=crop' },

            // Fragancias Unisex (2)
            { name: 'Jo Malone Lime Basil', description: 'Fragancia fresca y cítrica con albahaca. Elegancia británica.', price: 64990, stock: 35, low_stock_threshold: 7, category_id: categories[2].id, image_url: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=500&h=500&fit=crop' },
            { name: 'Tom Ford Black Orchid', description: 'Fragancia oscura y seductora con orquídea negra y especias.', price: 119990, stock: 12, low_stock_threshold: 2, category_id: categories[2].id, image_url: 'https://images.unsplash.com/photo-1606394131145-e1925b1d0f76?w=500&h=500&fit=crop' },

            // Ediciones Limitadas (2)
            { name: 'YSL Libre Intense', description: 'Edición limitada con lavanda y vainilla de Madagascar. Intensamente libre.', price: 109990, stock: 8, low_stock_threshold: 2, category_id: categories[3].id, image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500&h=500&fit=crop' },
            { name: 'Armani Privé Rose', description: 'Colección exclusiva con rosa de Damasco. Lujo absoluto.', price: 189990, stock: 5, low_stock_threshold: 1, category_id: categories[3].id, image_url: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=500&h=500&fit=crop' }
        ];

        const products = await Product.bulkCreate(productsData);
        console.log('✅ 12 Productos creados');

        // 5. Create Sample Orders with varied dates for chart visualization
        console.log('📊 Creando órdenes de ejemplo para gráficos...');

        // Get users for orders (clients)
        const clients = await User.findAll({
            include: [{ model: Role, where: { name: 'Cliente' } }]
        });

        if (clients.length > 0) {
            const { Order, OrderItem } = await import('../models/index.js');

            // Helper to create date in the past
            const daysAgo = (days) => {
                const date = new Date();
                date.setDate(date.getDate() - days);
                return date;
            };

            // Generate ticket number
            const generateTicket = (index) => `WS-${Date.now()}-${String(index).padStart(4, '0')}`;

            // Sample orders spanning last 90 days
            const ordersData = [
                // Recent orders (last 7 days)
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 89990, tax: 17098, created_at: daysAgo(1), ticket_number: generateTicket(1) },
                { user_id: clients[1 % clients.length].id, status: 'Enviado', payment_status: 'Completado', total: 159980, tax: 30396, created_at: daysAgo(2), ticket_number: generateTicket(2) },
                { user_id: clients[0].id, status: 'Confirmado', payment_status: 'Completado', total: 74990, tax: 14248, created_at: daysAgo(3), ticket_number: generateTicket(3) },
                { user_id: clients[1 % clients.length].id, status: 'Pendiente', payment_status: 'Pendiente', total: 94990, tax: 18048, created_at: daysAgo(5), ticket_number: generateTicket(4) },

                // Last week
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 149990, tax: 28498, created_at: daysAgo(8), ticket_number: generateTicket(5) },
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 64990, tax: 12348, created_at: daysAgo(10), ticket_number: generateTicket(6) },
                { user_id: clients[0].id, status: 'Cancelado', payment_status: 'Reembolsado', total: 79990, tax: 15198, created_at: daysAgo(12), ticket_number: generateTicket(7) },

                // 2 weeks ago
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 189990, tax: 36098, created_at: daysAgo(14), ticket_number: generateTicket(8) },
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 119990, tax: 22798, created_at: daysAgo(16), ticket_number: generateTicket(9) },

                // 3 weeks ago
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 99990, tax: 18998, created_at: daysAgo(20), ticket_number: generateTicket(10) },
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 84990, tax: 16148, created_at: daysAgo(22), ticket_number: generateTicket(11) },

                // 1 month ago
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 174980, tax: 33246, created_at: daysAgo(30), ticket_number: generateTicket(12) },
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 59990, tax: 11398, created_at: daysAgo(32), ticket_number: generateTicket(13) },
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 109990, tax: 20898, created_at: daysAgo(35), ticket_number: generateTicket(14) },

                // 6 weeks ago
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 94990, tax: 18048, created_at: daysAgo(42), ticket_number: generateTicket(15) },
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 139980, tax: 26596, created_at: daysAgo(45), ticket_number: generateTicket(16) },

                // 2 months ago
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 189990, tax: 36098, created_at: daysAgo(55), ticket_number: generateTicket(17) },
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 79990, tax: 15198, created_at: daysAgo(60), ticket_number: generateTicket(18) },
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 64990, tax: 12348, created_at: daysAgo(65), ticket_number: generateTicket(19) },

                // 3 months ago
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 149990, tax: 28498, created_at: daysAgo(75), ticket_number: generateTicket(20) },
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 99990, tax: 18998, created_at: daysAgo(80), ticket_number: generateTicket(21) },
                { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 119990, tax: 22798, created_at: daysAgo(85), ticket_number: generateTicket(22) },
                { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 74990, tax: 14248, created_at: daysAgo(90), ticket_number: generateTicket(23) }
            ];

            // Create orders one by one to set created_at properly
            for (const orderData of ordersData) {
                const createdAt = orderData.created_at;
                delete orderData.created_at;

                const order = await Order.create(orderData);

                // Update created_at directly (Sequelize doesn't allow setting it on create)
                await order.update({ created_at: createdAt }, { silent: true });

                // Add random order items AND create Reservations (dashboard uses Reservations for charts)
                const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
                const shuffledProducts = [...products].sort(() => Math.random() - 0.5);

                for (let i = 0; i < numItems && i < shuffledProducts.length; i++) {
                    const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
                    const price = shuffledProducts[i].price;

                    // Create OrderItem
                    await OrderItem.create({
                        order_id: order.id,
                        product_id: shuffledProducts[i].id,
                        quantity: quantity,
                        price: price
                    });

                    // Create Reservation (used by dashboard for charts)
                    const expiryDate = new Date(createdAt);
                    expiryDate.setDate(expiryDate.getDate() + 7);

                    const reservation = await Reservation.create({
                        user_id: orderData.user_id,
                        product_id: shuffledProducts[i].id,
                        order_id: order.id,
                        quantity: quantity,
                        status: 'Completada',
                        reservation_date: createdAt,
                        expiry_date: expiryDate,
                        total_price: price * quantity,
                        notes: 'Reserva generada por seed automático'
                    });

                    // Update reservation_date directly
                    await reservation.update({ reservation_date: createdAt }, { silent: true });
                }
            }

            console.log(`✅ ${ordersData.length} Órdenes creadas con items y reservaciones`);
        } else {
            console.log('⚠️ No se encontraron clientes para crear órdenes');
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🎉 ¡Auto-seed completado exitosamente!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📧 Credenciales de prueba: [email]@whitestar.cl / password123');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error en auto-seed:', error.message);
        // Don't crash the server, just log the error
    }
}

/**
 * Separate function to seed orders only
 * Can be called independently if products exist but orders don't
 */
async function seedOrders() {
    try {
        // Get clients
        const clients = await User.findAll({
            include: [{ model: Role, where: { name: 'Cliente' } }]
        });

        // Get products
        const products = await Product.findAll();

        if (clients.length === 0) {
            console.log('⚠️ No se encontraron clientes para crear órdenes');
            return;
        }

        if (products.length === 0) {
            console.log('⚠️ No se encontraron productos para crear órdenes');
            return;
        }

        // Helper to create date in the past
        const daysAgo = (days) => {
            const date = new Date();
            date.setDate(date.getDate() - days);
            return date;
        };

        // Generate ticket number
        const generateTicket = (index) => `WS-${Date.now()}-${String(index).padStart(4, '0')}`;

        // Sample orders spanning last 90 days
        const ordersData = [
            // Recent orders (last 7 days)
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 89990, tax: 17098, created_at: daysAgo(1), ticket_number: generateTicket(1) },
            { user_id: clients[1 % clients.length].id, status: 'Enviado', payment_status: 'Completado', total: 159980, tax: 30396, created_at: daysAgo(2), ticket_number: generateTicket(2) },
            { user_id: clients[0].id, status: 'Confirmado', payment_status: 'Completado', total: 74990, tax: 14248, created_at: daysAgo(3), ticket_number: generateTicket(3) },
            { user_id: clients[1 % clients.length].id, status: 'Pendiente', payment_status: 'Pendiente', total: 94990, tax: 18048, created_at: daysAgo(5), ticket_number: generateTicket(4) },

            // Last week
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 149990, tax: 28498, created_at: daysAgo(8), ticket_number: generateTicket(5) },
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 64990, tax: 12348, created_at: daysAgo(10), ticket_number: generateTicket(6) },
            { user_id: clients[0].id, status: 'Cancelado', payment_status: 'Reembolsado', total: 79990, tax: 15198, created_at: daysAgo(12), ticket_number: generateTicket(7) },

            // 2 weeks ago
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 189990, tax: 36098, created_at: daysAgo(14), ticket_number: generateTicket(8) },
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 119990, tax: 22798, created_at: daysAgo(16), ticket_number: generateTicket(9) },

            // 3 weeks ago
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 99990, tax: 18998, created_at: daysAgo(20), ticket_number: generateTicket(10) },
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 84990, tax: 16148, created_at: daysAgo(22), ticket_number: generateTicket(11) },

            // 1 month ago
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 174980, tax: 33246, created_at: daysAgo(30), ticket_number: generateTicket(12) },
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 59990, tax: 11398, created_at: daysAgo(32), ticket_number: generateTicket(13) },
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 109990, tax: 20898, created_at: daysAgo(35), ticket_number: generateTicket(14) },

            // 6 weeks ago
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 94990, tax: 18048, created_at: daysAgo(42), ticket_number: generateTicket(15) },
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 139980, tax: 26596, created_at: daysAgo(45), ticket_number: generateTicket(16) },

            // 2 months ago
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 189990, tax: 36098, created_at: daysAgo(55), ticket_number: generateTicket(17) },
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 79990, tax: 15198, created_at: daysAgo(60), ticket_number: generateTicket(18) },
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 64990, tax: 12348, created_at: daysAgo(65), ticket_number: generateTicket(19) },

            // 3 months ago
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 149990, tax: 28498, created_at: daysAgo(75), ticket_number: generateTicket(20) },
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 99990, tax: 18998, created_at: daysAgo(80), ticket_number: generateTicket(21) },
            { user_id: clients[1 % clients.length].id, status: 'Entregado', payment_status: 'Completado', total: 119990, tax: 22798, created_at: daysAgo(85), ticket_number: generateTicket(22) },
            { user_id: clients[0].id, status: 'Entregado', payment_status: 'Completado', total: 74990, tax: 14248, created_at: daysAgo(90), ticket_number: generateTicket(23) }
        ];

        // Create orders one by one to set created_at properly
        for (const orderData of ordersData) {
            const createdAt = orderData.created_at;
            delete orderData.created_at;

            const order = await Order.create(orderData);

            // Update created_at directly (Sequelize doesn't allow setting it on create)
            await order.update({ created_at: createdAt }, { silent: true });

            // Add random order items AND create Reservations (dashboard uses Reservations for charts)
            const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
            const shuffledProducts = [...products].sort(() => Math.random() - 0.5);

            for (let i = 0; i < numItems && i < shuffledProducts.length; i++) {
                const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
                const price = shuffledProducts[i].price;

                // Create OrderItem
                await OrderItem.create({
                    order_id: order.id,
                    product_id: shuffledProducts[i].id,
                    quantity: quantity,
                    price: price
                });

                // Create Reservation (used by dashboard for charts)
                const expiryDate = new Date(createdAt);
                expiryDate.setDate(expiryDate.getDate() + 7);

                const reservation = await Reservation.create({
                    user_id: orderData.user_id,
                    product_id: shuffledProducts[i].id,
                    order_id: order.id,
                    quantity: quantity,
                    status: 'Completada',
                    reservation_date: createdAt,
                    expiry_date: expiryDate,
                    total_price: price * quantity,
                    notes: 'Reserva generada por seed automático'
                });

                // Update reservation_date directly
                await reservation.update({ reservation_date: createdAt }, { silent: true });
            }
        }

        console.log(`✅ ${ordersData.length} Órdenes creadas con items y reservaciones`);
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 ¡Seed de órdenes completado!');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error en seed de órdenes:', error.message);
    }
}
