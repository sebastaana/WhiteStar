import { sequelize } from './src/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateDatabase() {
    try {
        console.log('🔄 Iniciando migración de base de datos...\n');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida\n');

        // Sync all models
        console.log('📦 Sincronizando modelos...');
        await sequelize.sync({ alter: true });

        console.log('\n✅ Migración completada exitosamente!');
        console.log('\n📋 Tablas creadas/actualizadas:');
        console.log('   - products (actualizada con low_stock_threshold, reserved_stock)');
        console.log('   - orders (actualizada con payment_status, ticket_number, reservation_id)');
        console.log('   - reservations (nueva)');
        console.log('   - promotions (nueva)');
        console.log('   - complaints (nueva)');
        console.log('   - stock_alerts (nueva)');
        console.log('   - stock_movements (nueva)');
        console.log('   - payment_methods (nueva)');
        console.log('   - payments (nueva)');

        console.log('\n🎉 Base de datos lista para usar!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

migrateDatabase();
