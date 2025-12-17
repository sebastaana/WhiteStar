import { sequelize, Role, User } from './models/index.js';
import bcrypt from 'bcryptjs';

const createGerente = async () => {
    try {
        await sequelize.sync(); // No force: true, to keep data

        // 1. Create or find 'Gerente' role
        const [gerenteRole, created] = await Role.findOrCreate({
            where: { name: 'Gerente' },
            defaults: { name: 'Gerente' }
        });

        if (created) {
            console.log('✅ Rol "Gerente" creado.');
        } else {
            console.log('ℹ️ Rol "Gerente" ya existía.');
        }

        // 2. Create 'Gerente' user
        const email = 'gerente@perfumestore.com';
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            console.log('ℹ️ Usuario gerente@perfumestore.com ya existe. Actualizando rol...');
            existingUser.role_id = gerenteRole.id;
            await existingUser.save();
            console.log('✅ Rol actualizado a Gerente.');
        } else {
            await User.create({
                email,
                password_hash: await bcrypt.hash('gerente123', 12),
                first_name: 'Gerente',
                last_name: 'General',
                role_id: gerenteRole.id
            });
            console.log('✅ Usuario gerente@perfumestore.com creado (Pass: gerente123).');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

createGerente();
