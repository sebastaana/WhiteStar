import { User, Role, Product, Category, Order, OrderItem, Reservation, Complaint, sequelize } from './src/models/index.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Op } from 'sequelize';

dotenv.config();

const ROLES = {
    ADMIN: 'Admin',
    GERENTE: 'Gerente',
    VENDEDOR: 'Vendedor',
    ADMIN_STOCK: 'Administrador de Stock',
    ATENCION_CLIENTE: 'Atención al Cliente',
    CLIENTE: 'Cliente'
};

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seeding de base de datos...\n');

        // Sync database to ensure tables exist
        await sequelize.sync({ force: true });
        console.log('✓ Base de datos sincronizada (force: true)');

        // 1. Crear Roles
        console.log('📝 Creando roles...');
        const roles = await Promise.all([
            Role.create({ name: ROLES.ADMIN, description: 'Administrador del sistema' }),
            Role.create({ name: ROLES.GERENTE, description: 'Gerente de la tienda' }),
            Role.create({ name: ROLES.VENDEDOR, description: 'Vendedor' }),
            Role.create({ name: ROLES.ADMIN_STOCK, description: 'Administrador de inventario' }),
            Role.create({ name: ROLES.ATENCION_CLIENTE, description: 'Atención al cliente' }),
            Role.create({ name: ROLES.CLIENTE, description: 'Cliente' })
        ]);

        const roleMap = {};
        roles.forEach((role) => {
            roleMap[role.name] = role.id;
        });
        console.log('✅ Roles creados\n');

        // 2. Crear Usuarios de Prueba
        console.log('👥 Creando usuarios de prueba...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const testUsers = [
            // Admin
            { email: 'admin@whitestar.cl', password_hash: hashedPassword, first_name: 'Admin', last_name: 'Sistema', role_id: roleMap[ROLES.ADMIN] },
            // Gerente
            { email: 'gerente@whitestar.cl', password_hash: hashedPassword, first_name: 'Carlos', last_name: 'Rodríguez', role_id: roleMap[ROLES.GERENTE] },
            // Vendedores
            { email: 'vendedor1@whitestar.cl', password_hash: hashedPassword, first_name: 'María', last_name: 'González', role_id: roleMap[ROLES.VENDEDOR] },
            { email: 'vendedor2@whitestar.cl', password_hash: hashedPassword, first_name: 'Juan', last_name: 'Pérez', role_id: roleMap[ROLES.VENDEDOR] },
            // Administrador de Stock
            { email: 'stock@whitestar.cl', password_hash: hashedPassword, first_name: 'Pedro', last_name: 'Martínez', role_id: roleMap[ROLES.ADMIN_STOCK] },
            // Atención al Cliente
            { email: 'atencion1@whitestar.cl', password_hash: hashedPassword, first_name: 'Ana', last_name: 'López', role_id: roleMap[ROLES.ATENCION_CLIENTE] },
            { email: 'atencion2@whitestar.cl', password_hash: hashedPassword, first_name: 'Luis', last_name: 'Fernández', role_id: roleMap[ROLES.ATENCION_CLIENTE] },
            // Clientes
            { email: 'cliente1@gmail.com', password_hash: hashedPassword, first_name: 'Sofia', last_name: 'Torres', role_id: roleMap[ROLES.CLIENTE] },
            { email: 'cliente2@gmail.com', password_hash: hashedPassword, first_name: 'Diego', last_name: 'Ramírez', role_id: roleMap[ROLES.CLIENTE] },
            { email: 'cliente3@gmail.com', password_hash: hashedPassword, first_name: 'Valentina', last_name: 'Silva', role_id: roleMap[ROLES.CLIENTE] }
        ];

        const createdUsers = await User.bulkCreate(testUsers);
        console.log('✅ Usuarios creados\n');

        // 3. Crear Categorías
        console.log('📦 Creando categorías...');
        const categoriesData = [
            { name: 'Fragancias Femeninas', description: 'Perfumes para mujer' },
            { name: 'Fragancias Masculinas', description: 'Perfumes para hombre' },
            { name: 'Fragancias Unisex', description: 'Perfumes unisex' },
            { name: 'Ediciones Limitadas', description: 'Colecciones exclusivas' }
        ];
        const categories = await Category.bulkCreate(categoriesData);
        console.log('✅ Categorías creadas\n');

        // 4. Crear Productos
        console.log('🧴 Creando productos...');
        const productsData = [
            // Masculinos
            { name: 'Bleu de Chanel', description: 'Fragancia fresca y sofisticada.', price: 89990, stock: 25, category_id: categories[1].id, image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop' },
            { name: 'Dior Sauvage', description: 'Fragancia icónica con notas de pimienta.', price: 79990, stock: 30, category_id: categories[1].id, image_url: 'https://images.unsplash.com/photo-1588405748390-9fbc4d9d7ffa?w=500&h=500&fit=crop' },
            { name: 'Creed Aventus', description: 'Fragancia de lujo.', price: 149990, stock: 15, category_id: categories[1].id, image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' },
            // Femeninos
            { name: 'Chanel No. 5', description: 'La fragancia más icónica del mundo.', price: 99990, stock: 20, category_id: categories[0].id, image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop&crop=faces' },
            { name: 'Miss Dior', description: 'Fragancia romántica y fresca.', price: 84990, stock: 28, category_id: categories[0].id, image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop&crop=bottom' },
            // Unisex
            { name: 'Jo Malone Lime Basil', description: 'Fragancia fresca y cítrica.', price: 64990, stock: 35, category_id: categories[2].id, image_url: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=500&h=500&fit=crop' },
            { name: 'Tom Ford Black Orchid', description: 'Fragancia oscura y seductora.', price: 119990, stock: 12, category_id: categories[2].id, image_url: 'https://images.unsplash.com/photo-1606394131145-e1925b1d0f76?w=500&h=500&fit=crop' }
        ];

        const products = await Product.bulkCreate(productsData);
        console.log('✅ Productos creados\n');

        // 5. Crear Órdenes
        console.log('🛍️ Creando órdenes...');
        const customers = createdUsers.filter(u => u.role_id === roleMap[ROLES.CLIENTE]);
        const orders = [];

        for (const customer of customers) {
            // Crear 2-3 órdenes por cliente
            const numOrders = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < numOrders; i++) {
                const orderProducts = products.sort(() => 0.5 - Math.random()).slice(0, 2);
                let total = 0;

                const order = await Order.create({
                    user_id: customer.id,
                    status: ['Pendiente', 'Confirmado', 'Enviado', 'Entregado'][Math.floor(Math.random() * 4)],
                    total: 0, // Se actualizará
                    tax: 0
                });

                for (const prod of orderProducts) {
                    await OrderItem.create({
                        order_id: order.id,
                        product_id: prod.id,
                        quantity: 1,
                        price: prod.price
                    });
                    total += prod.price;
                }

                order.total = total;
                order.tax = Math.round(total * 0.19);
                await order.save();
                orders.push(order);
            }
        }
        console.log('✅ Órdenes creadas\n');

        // 6. Crear Reservas
        console.log('📅 Creando reservas...');
        const allUsers = createdUsers.filter(u => u.role_id !== roleMap[ROLES.ADMIN]); // Todos menos admin

        for (const user of allUsers) {
            // Crear entre 1 y 4 reservas por usuario
            const numReservations = Math.floor(Math.random() * 4) + 1;

            for (let i = 0; i < numReservations; i++) {
                const prod = products[Math.floor(Math.random() * products.length)];

                // Generar fecha aleatoria en los últimos 30 días
                const daysAgo = Math.floor(Math.random() * 30);
                const reservationDate = new Date();
                reservationDate.setDate(reservationDate.getDate() - daysAgo);

                await Reservation.create({
                    user_id: user.id,
                    product_id: prod.id,
                    quantity: Math.floor(Math.random() * 3) + 1,
                    status: ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'][Math.floor(Math.random() * 4)],
                    reservation_date: reservationDate,
                    expiry_date: new Date(reservationDate.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 días
                    total_price: prod.price
                });
            }
        }
        console.log('✅ Reservas creadas\n');

        // 7. Crear Reclamos
        console.log('📢 Creando reclamos...');
        const customerServiceAgents = createdUsers.filter(u => u.role_id === roleMap[ROLES.ATENCION_CLIENTE]);

        for (const order of orders.slice(0, 5)) { // Crear reclamos para las primeras 5 órdenes
            await Complaint.create({
                user_id: order.user_id,
                order_id: order.id,
                subject: 'Problema con el pedido',
                description: 'El producto llegó dañado o no corresponde.',
                status: ['Abierto', 'En Proceso', 'Resuelto'][Math.floor(Math.random() * 3)],
                priority: ['Baja', 'Media', 'Alta'][Math.floor(Math.random() * 3)],
                assigned_to: customerServiceAgents[0]?.id,
                category: 'Producto'
            });
        }
        console.log('✅ Reclamos creados\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('🎉 ¡Base de datos poblada exitosamente!');
        console.log('═══════════════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seeding:', error);
        process.exit(1);
    }
}

seedDatabase();
