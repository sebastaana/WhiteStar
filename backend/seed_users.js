import bcrypt from 'bcryptjs';
import { User, Role, sequelize } from './src/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
    try {
        console.log('🌱 Iniciando seed de usuarios...\n');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✓ Conectado a la base de datos\n');

        // Obtener roles
        const roles = await Role.findAll();
        const roleMap = {};
        roles.forEach(role => {
            roleMap[role.name] = role.id;
        });

        console.log('📋 Roles disponibles:', Object.keys(roleMap).join(', '), '\n');

        // Verificar que existan todos los roles necesarios
        const requiredRoles = ['Cliente', 'Vendedor', 'Administrador de Stock', 'Atención al Cliente', 'Gerente', 'Admin'];
        const missingRoles = requiredRoles.filter(role => !roleMap[role]);

        if (missingRoles.length > 0) {
            console.error('❌ Faltan los siguientes roles en la base de datos:', missingRoles.join(', '));
            console.log('\n💡 Ejecuta primero el script de migración para crear los roles.');
            process.exit(1);
        }

        // Hash de contraseña por defecto
        const defaultPassword = await bcrypt.hash('password123', 10);

        // Array de usuarios a crear
        const users = [
            // 1 Admin
            {
                first_name: 'Administrador',
                last_name: 'Principal',
                email: 'admin@whitestar.com',
                password: defaultPassword,
                role_id: roleMap['Admin'],
                phone: '+56912345678',
                address: 'Oficina Central, Santiago',
                is_active: true
            },
            // 1 Gerente
            {
                first_name: 'Carlos',
                last_name: 'Gerente',
                email: 'gerente@whitestar.com',
                password: defaultPassword,
                role_id: roleMap['Gerente'],
                phone: '+56912345679',
                address: 'Oficina Gerencia, Santiago',
                is_active: true
            },
            // 1 Vendedor
            {
                first_name: 'María',
                last_name: 'Vendedora',
                email: 'vendedor@whitestar.com',
                password: defaultPassword,
                role_id: roleMap['Vendedor'],
                phone: '+56912345680',
                address: 'Tienda Principal, Santiago',
                is_active: true
            },
            // 1 Administrador de Stock
            {
                first_name: 'Pedro',
                last_name: 'Inventario',
                email: 'stock@whitestar.com',
                password: defaultPassword,
                role_id: roleMap['Administrador de Stock'],
                phone: '+56912345681',
                address: 'Bodega Central, Santiago',
                is_active: true
            },
            // 1 Atención al Cliente
            {
                first_name: 'Ana',
                last_name: 'Soporte',
                email: 'atencion@whitestar.com',
                password: defaultPassword,
                role_id: roleMap['Atención al Cliente'],
                phone: '+56912345682',
                address: 'Centro de Atención, Santiago',
                is_active: true
            },
            // 10 Clientes
            {
                first_name: 'Juan',
                last_name: 'Pérez',
                email: 'juan.perez@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654321',
                address: 'Av. Providencia 1234, Santiago',
                is_active: true
            },
            {
                first_name: 'María',
                last_name: 'González',
                email: 'maria.gonzalez@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654322',
                address: 'Calle Las Condes 567, Santiago',
                is_active: true
            },
            {
                first_name: 'Luis',
                last_name: 'Rodríguez',
                email: 'luis.rodriguez@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654323',
                address: 'Av. Apoquindo 890, Las Condes',
                is_active: true
            },
            {
                first_name: 'Carmen',
                last_name: 'Martínez',
                email: 'carmen.martinez@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654324',
                address: 'Calle Vitacura 234, Vitacura',
                is_active: true
            },
            {
                first_name: 'Roberto',
                last_name: 'Fernández',
                email: 'roberto.fernandez@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654325',
                address: 'Av. Kennedy 456, Las Condes',
                is_active: true
            },
            {
                first_name: 'Patricia',
                last_name: 'López',
                email: 'patricia.lopez@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654326',
                address: 'Calle Isidora 789, Las Condes',
                is_active: true
            },
            {
                first_name: 'Diego',
                last_name: 'Sánchez',
                email: 'diego.sanchez@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654327',
                address: 'Av. Manquehue 321, Vitacura',
                is_active: true
            },
            {
                first_name: 'Valentina',
                last_name: 'Torres',
                email: 'valentina.torres@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654328',
                address: 'Calle El Bosque 654, Las Condes',
                is_active: true
            },
            {
                first_name: 'Andrés',
                last_name: 'Ramírez',
                email: 'andres.ramirez@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654329',
                address: 'Av. Américo Vespucio 987, La Reina',
                is_active: true
            },
            {
                first_name: 'Sofía',
                last_name: 'Herrera',
                email: 'sofia.herrera@gmail.com',
                password: defaultPassword,
                role_id: roleMap['Cliente'],
                phone: '+56987654330',
                address: 'Calle Los Leones 147, Providencia',
                is_active: true
            }
        ];

        console.log('👥 Creando usuarios...\n');

        let created = 0;
        let skipped = 0;

        for (const userData of users) {
            try {
                // Verificar si el usuario ya existe
                const existingUser = await User.findOne({ where: { email: userData.email } });

                if (existingUser) {
                    console.log(`⏭️  Usuario ya existe: ${userData.email}`);
                    skipped++;
                    continue;
                }

                // Crear usuario
                const user = await User.create(userData);
                const role = roles.find(r => r.id === userData.role_id);
                console.log(`✅ Creado: ${user.first_name} ${user.last_name} (${role.name}) - ${user.email}`);
                created++;
            } catch (error) {
                console.error(`❌ Error creando ${userData.email}:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN:');
        console.log('='.repeat(60));
        console.log(`✅ Usuarios creados: ${created}`);
        console.log(`⏭️  Usuarios omitidos (ya existían): ${skipped}`);
        console.log(`📝 Total procesados: ${users.length}`);
        console.log('='.repeat(60));

        console.log('\n🔑 CREDENCIALES DE ACCESO:');
        console.log('='.repeat(60));
        console.log('Contraseña para todos los usuarios: password123\n');

        console.log('👤 USUARIOS ADMINISTRATIVOS:');
        console.log('  Admin:              admin@whitestar.com');
        console.log('  Gerente:            gerente@whitestar.com');
        console.log('  Vendedor:           vendedor@whitestar.com');
        console.log('  Admin Stock:        stock@whitestar.com');
        console.log('  Atención Cliente:   atencion@whitestar.com\n');

        console.log('👥 CLIENTES (10):');
        users.filter(u => u.role_id === roleMap['Cliente']).forEach((u, i) => {
            console.log(`  Cliente ${i + 1}:          ${u.email}`);
        });
        console.log('='.repeat(60));

        console.log('\n✨ Seed completado exitosamente!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error en el seed:', error);
        process.exit(1);
    }
};

// Ejecutar seed
seedUsers();
