// Permitir múltiples orígenes para flexibilidad en despliegues
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://whitesstar.vercel.app',
  'https://whitestar-six.vercel.app',
  'https://white-starsas.vercel.app',
  'https://white-starrrr.vercel.app',
  'https://whiteee-starrr.vercel.app',
  'https://whiteee-starrr.vercel.app', // URL de producción actual
  'https://white-starrrr-ced3mh8oh-sebastaanas-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean); // Eliminar valores undefined

// Patrón para URLs de Vercel (cualquier variación de whitestar)
const vercelPreviewPattern = /^https:\/\/white.*star.*\.vercel\.app$/;

export const corsConfig = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // Verificar si el origin está en la lista permitida O coincide con el patrón de Vercel
    if (allowedOrigins.indexOf(origin) !== -1 || vercelPreviewPattern.test(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS bloqueado para origen:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};