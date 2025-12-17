import { User, Role } from './src/models/index.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
    try {
        console.log('🔐 Creando cuenta de administrador...\n');

        // 1. Buscar o crear el rol de Admin
        let adminRole = await Role.findOne({ where: { name: 'Admin' } });

        if (!adminRole) {
            console.log('📝 Creando rol de Admin...');
            adminRole = await Role.create({
                name: 'Admin',
                description: 'Administrador del sistema'
            });
            console.log('✅ Rol de Admin creado\n');
        } else {
            console.log('✅ Rol de Admin encontrado\n');
        }

        // 2. Verificar si ya existe un admin
        const existingAdmin = await User.findOne({
            where: { email: 'admin@whitestar.cl' }
        });

        if (existingAdmin) {
            console.log('⚠️  Ya existe un usuario admin con email: admin@whitestar.cl');
            console.log('📧 Email: admin@whitestar.cl');
            console.log('🔑 Contraseña: password123\n');

            // Actualizar la contraseña por si acaso
            const hashedPassword = await bcrypt.hash('password123', 10);
            await existingAdmin.update({ password_hash: hashedPassword });
            console.log('✅ Contraseña actualizada\n');
        } else {
            // 3. Crear nuevo usuario admin
            console.log('👤 Creando nuevo usuario admin...');
            const hashedPassword = await bcrypt.hash('password123', 10);

            const admin = await User.create({
                email: 'admin@whitestar.cl',
                password_hash: hashedPassword,
                first_name: 'Admin',
                last_name: 'Sistema',
                role_id: adminRole.id
            });

            console.log('✅ Usuario admin creado exitosamente!\n');
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log('🎉 Credenciales de Administrador:');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📧 Email:      admin@whitestar.cl');
        console.log('🔑 Contraseña: password123');
        console.log('═══════════════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear admin:', error);
        process.exit(1);
    }
}

createAdmin();
