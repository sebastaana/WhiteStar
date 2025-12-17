import { sequelize } from './src/config/database.js';
import './src/models/index.js';

/**
 * Script de inicialización automática para producción
 * Este script se ejecuta automáticamente al iniciar el servidor en Railway
 * y asegura que la base de datos esté lista
 */

async function autoMigrate() {
    try {
        console.log('🚀 Iniciando migración automática...');
        console.log('📊 Entorno:', process.env.NODE_ENV);

        // 1. Verificar conexión
        console.log('🔄 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✓ Conexión establecida exitosamente');

        // 2. Sincronizar modelos
        console.log('🔄 Sincronizando modelos con la base de datos...');

        if (process.env.NODE_ENV === 'production') {
            // En producción: crear tablas que no existan, actualizar las existentes
            await sequelize.sync({ alter: true });
            console.log('✓ Base de datos sincronizada (modo producción)');
        } else {
            // En desarrollo: sincronización completa
            await sequelize.sync({ alter: true });
            console.log('✓ Base de datos sincronizada (modo desarrollo)');
        }

        console.log('');
        console.log('✅ Migración completada exitosamente!');
        console.log('');
        console.log('📝 Próximos pasos recomendados:');
        console.log('   1. Ejecutar: railway run npm run seed');
        console.log('   2. Ejecutar: railway run npm run create-admin');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('❌ Error durante la migración:');
        console.error(error.message);
        console.error('');
        console.error('Stack trace:', error.stack);
        console.error('');
        console.error('💡 Verifica que:');
        console.error('   - Las credenciales de MySQL sean correctas');
        console.error('   - El servicio MySQL esté activo en Railway');
        console.error('   - Las variables DB_* estén configuradas');
        console.error('');
        process.exit(1);
    }
}

// Ejecutar migración
autoMigrate();
