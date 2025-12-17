import { sequelize, Role, User, Category, Product, Order, OrderItem } from '../models/index.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✓ Base de datos sincronizada');

    const roles = await Role.bulkCreate([
      { name: 'Cliente' },
      { name: 'Vendedor' },
      { name: 'Inventario' },
      { name: 'Admin' }
    ]);
    console.log('✓ Roles creados');


    const admin = await User.create({
      email: 'admin@perfumestore.com',
      password_hash: await bcrypt.hash('admin123', 12),
      first_name: 'Admin',
      last_name: 'System',
      role_id: roles[3].id
    });

    const users = [];
    const demoUsers = [
      { email: 'cliente@perfumestore.com', first_name: 'Carlos', last_name: 'García' },
      { email: 'vendedor@perfumestore.com', first_name: 'Maria', last_name: 'López', roleId: 1 },
      { email: 'test@perfumestore.com', first_name: 'Juan', last_name: 'Pérez' }
    ];

    for (const u of demoUsers) {
      users.push(await User.create({
        email: u.email,
        password_hash: await bcrypt.hash('password123', 12),
        first_name: u.first_name,
        last_name: u.last_name,
        role_id: u.roleId ? roles[1].id : roles[0].id
      }));
    }

    for (let i = 0; i < 15; i++) {
      users.push(await User.create({
        email: `user${i}@perfumestore.com`,
        password_hash: await bcrypt.hash('password123', 12),
        first_name: `Usuario${i}`,
        last_name: `Test${i}`,
        role_id: roles[0].id
      }));
    }

    console.log(`✓ ${users.length + 1} usuarios creados`);

    const categories = await Category.bulkCreate([
      {
        name: 'Perfumes Masculinos',
        description: 'Fragancias diseñadas para hombres con notas dominantes y aroma envolvente'
      },
      {
        name: 'Perfumes Femeninos',
        description: 'Fragancias elegantes y sofisticadas para mujeres modernas'
      },
      {
        name: 'Unisex',
        description: 'Fragancias versátiles que pueden ser usadas por cualquier género'
      },
      {
        name: 'Eau de Toilette',
        description: 'Concentración moderada, ideal para uso diario'
      },
      {
        name: 'Eau de Parfum',
        description: 'Mayor concentración de fragancia, duración extendida'
      }
    ]);
    console.log('✓ Categorías de Perfumería creadas');

    // PRODUCTOS CON IMÁGENES REALES
    const perfumeProducts = [
      // Masculinos Premium
      {
        name: 'Bleu de Chanel',
        description: 'Fragancia fresca y sofisticada con notas de sándalo y cedro. Ideal para hombres refinados que buscan una fragancia de larga duración.',
        price: 89.99,
        stock: 25,
        category_id: categories[0].id,
        image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop'
      },
      {
        name: 'Dior Sauvage',
        description: 'Fragancia icónica con notas de pimienta y ambroxán. Elegante y versátil, perfecto para cualquier ocasión.',
        price: 79.99,
        stock: 30,
        category_id: categories[0].id,
        image_url: 'https://images.unsplash.com/photo-1588405748390-9fbc4d9d7ffa?w=500&h=500&fit=crop'
      },
      {
        name: 'Creed Aventus',
        description: 'Fragancia de lujo con notas de piña, cítricos y madera. Refleja la victoria y el éxito.',
        price: 149.99,
        stock: 15,
        category_id: categories[0].id,
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'
      },
      {
        name: 'Hugo Boss Bottled',
        description: 'Clásico masculino con notas de especias y madera. Aroma profundo y atractivo.',
        price: 59.99,
        stock: 40,
        category_id: categories[0].id,
        image_url: 'https://images.unsplash.com/photo-1610541144551-74dbc51b4ee0?w=500&h=500&fit=crop'
      },
      {
        name: 'Versace Eros',
        description: 'Fragancia fresca y vibrante con notas de menta y nueces. Energético y cautivador.',
        price: 69.99,
        stock: 35,
        category_id: categories[0].id,
        image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&h=500&fit=crop'
      },

      // Femeninos Premium
      {
        name: 'Chanel No. 5',
        description: 'La fragancia más icónica del mundo. Notas de jazmín, rosa y sándalo. Elegancia atemporal.',
        price: 99.99,
        stock: 20,
        category_id: categories[1].id,
        image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop&crop=faces'
      },
      {
        name: 'Miss Dior',
        description: 'Fragancia romántica y fresca con notas florales. Perfecto para mujeres modernas y elegantes.',
        price: 84.99,
        stock: 28,
        category_id: categories[1].id,
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop&crop=bottom'
      },
      {
        name: 'Lancôme La Vie Est Belle',
        description: 'Fragancia gourmand con notas de caramelo y pralinés. Dulce, sofisticada y adictiva.',
        price: 74.99,
        stock: 32,
        category_id: categories[1].id,
        image_url: 'https://images.unsplash.com/photo-1610541144551-74dbc51b4ee0?w=500&h=500&fit=crop&crop=bottom'
      },
      {
        name: 'Guerlain La Petite Robe Noire',
        description: 'Fragancia neroli, cerezo y vainilla. Juguetona, sensual y sofisticada.',
        price: 89.99,
        stock: 22,
        category_id: categories[1].id,
        image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&h=500&fit=crop&crop=bottom'
      },
      {
        name: 'YSL Mon Paris',
        description: 'Fragancia floral con notas de rosa de mayo y almizcares blancos. Romántica y cautivadora.',
        price: 79.99,
        stock: 30,
        category_id: categories[1].id,
        image_url: 'https://images.unsplash.com/photo-1623293182086-7651a899d37f?w=500&h=500&fit=crop'
      },

      // Unisex
      {
        name: 'Jo Malone Lime Basil & Mandarin',
        description: 'Fragancia fresca y cítrica. Perfecta para uso diario, unisex y versátil.',
        price: 64.99,
        stock: 35,
        category_id: categories[2].id,
        image_url: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=500&h=500&fit=crop'
      },
      {
        name: 'Maison Francis Kurkdjian À la rose',
        description: 'Fragancia refinada con notas de rosa y jazmín. Elegante y versátil para todos.',
        price: 94.99,
        stock: 18,
        category_id: categories[2].id,
        image_url: 'https://images.unsplash.com/photo-1585286551721-89054f55e4db?w=500&h=500&fit=crop'
      },
      {
        name: 'Byredo Gypsy Flare',
        description: 'Fragancia con notas especiadas y florales. Mysteriosa y cautivadora.',
        price: 109.99,
        stock: 14,
        category_id: categories[2].id,
        image_url: 'https://images.unsplash.com/photo-1598634268161-d4a36a32a4a8?w=500&h=500&fit=crop'
      },
      {
        name: 'Diptyque Baies',
        description: 'Fragancia con notas de bayas silvestres. Fresca, natural y adictiva.',
        price: 104.99,
        stock: 16,
        category_id: categories[2].id,
        image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=500&fit=crop'
      },
      {
        name: 'Tom Ford Black Orchid',
        description: 'Fragancia oscura y seductora con notas de orquídea negra. Unisex y sofisticada.',
        price: 119.99,
        stock: 12,
        category_id: categories[2].id,
        image_url: 'https://images.unsplash.com/photo-1606394131145-e1925b1d0f76?w=500&h=500&fit=crop'
      },

      // Eau de Toilette
      {
        name: 'Calvin Klein CK One',
        description: 'Fragancia de toilette fresca y ligera. Icónica y versátil para todos.',
        price: 44.99,
        stock: 50,
        category_id: categories[3].id,
        image_url: 'https://images.unsplash.com/photo-1559429800-4c4a34f93b5e?w=500&h=500&fit=crop'
      },
      {
        name: 'Acqua di Gioia Giorgio Armani',
        description: 'Eau de toilette fresca con notas marinas. Perfecta para el día a día.',
        price: 54.99,
        stock: 45,
        category_id: categories[3].id,
        image_url: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=500&h=500&fit=crop'
      },
      {
        name: 'Paco Rabanne Phantom',
        description: 'Eau de toilette fresca y limpia. Ideal para la oficina y uso diario.',
        price: 49.99,
        stock: 38,
        category_id: categories[3].id,
        image_url: 'https://images.unsplash.com/photo-1514906655109-81987b1e20b2?w=500&h=500&fit=crop'
      },

      // Eau de Parfum Premium
      {
        name: 'Parfums de Marly Layton',
        description: 'Eau de parfum con notas de tabaco y vainilla. Profundo y elegante.',
        price: 129.99,
        stock: 10,
        category_id: categories[4].id,
        image_url: 'https://images.unsplash.com/photo-1578762335295-cccabb5a615d?w=500&h=500&fit=crop'
      },
      {
        name: 'Heeley Sel Marin',
        description: 'Eau de parfum con notas salinas. Fresco y sofisticado.',
        price: 124.99,
        stock: 11,
        category_id: categories[4].id,
        image_url: 'https://images.unsplash.com/photo-1544235014-8692033cecfd?w=500&h=500&fit=crop'
      },
      {
        name: 'Orto Parisi Megamare',
        description: 'Eau de parfum con notas acuáticas. Refrescante y único.',
        price: 139.99,
        stock: 9,
        category_id: categories[4].id,
        image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&h=500&fit=crop'
      }
    ];

    const productsWithVendor = perfumeProducts.map((p, idx) => ({
      ...p,
      vendor_id: users[idx % users.length].id
    }));

    await Product.bulkCreate(productsWithVendor);
    console.log(`✓ ${perfumeProducts.length} productos de perfumería con imágenes creados`);

    let orderCount = 0;
    for (let i = 0; i < 8; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const orderProducts = perfumeProducts.slice(0, Math.floor(Math.random() * 3) + 1);

      let total = 0;
      const items = [];
      for (const prod of orderProducts) {
        const qty = 1;
        total += parseFloat(prod.price) * qty;
        items.push({
          product_id: prod.name,
          quantity: qty,
          price: prod.price
        });
      }

      const allProducts = await Product.findAll();
      const order = await Order.create({
        user_id: user.id,
        total: total.toFixed(2),
        tax: (total * 0.19).toFixed(2),
        status: ['Pendiente', 'Confirmado', 'Enviado', 'Entregado'][Math.floor(Math.random() * 4)]
      });

      for (const prod of orderProducts) {
        const product = allProducts.find(p => p.name === prod.name);
        if (product) {
          await OrderItem.create({
            order_id: order.id,
            product_id: product.id,
            quantity: 1,
            price: prod.price
          });
        }
      }

      orderCount++;
    }

    console.log(`✓ ${orderCount} órdenes de prueba creadas`);
    console.log('\n✅ Base de datos poblada exitosamente con datos de perfumería e imágenes');
    console.log('\n📊 RESUMEN:');
    console.log(`  • ${users.length + 1} usuarios`);
    console.log(`  • ${categories.length} categorías`);
    console.log(`  • ${perfumeProducts.length} perfumes con imágenes reales`);
    console.log(`  • ${orderCount} órdenes`);
    console.log('\n🔐 Credenciales de prueba:');
    console.log('  Email: admin@perfumestore.com');
    console.log('  Contraseña: admin123');
    console.log('\n  Email: cliente@perfumestore.com');
    console.log('  Contraseña: password123');
    console.log('\n📷 Las imágenes se cargan desde Unsplash (gratis y legal)');

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err);
    process.exit(1);
  }
};

seedDatabase();
