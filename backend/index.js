import dotenv from 'dotenv';
import app from './src/app.js';
import sequelize from './src/config/database.js';
// Importar modelos para que se registren en Sequelize
import './src/models/index.js';
import { autoSeedDatabase } from './src/utils/autoSeed.js';


dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // 1. Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✓ Base de datos conectada');

    // 2. Sincronizar modelos automáticamente
    console.log('🔄 Sincronizando modelos...');
    if (process.env.NODE_ENV === 'development') {
      // En desarrollo: actualizar tablas si hay cambios en los modelos
      await sequelize.sync({ alter: true });
      console.log('✓ Modelos sincronizados (alter mode)');
    } else {
      // En producción: solo crear tablas que no existan, sin modificar las existentes
      await sequelize.sync();
      console.log('✓ Modelos sincronizados');
    }

    // 3. Auto-seed si la base de datos está vacía
    await autoSeedDatabase();

    // 4. Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✓ Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('✗ Error:', err);
    process.exit(1);
  }
};

startServer();