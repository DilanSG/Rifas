import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';

// Rutas
import boletaRoutes from './routes/boletaRoutes';
import pagoRoutes from './routes/pagoRoutes';
import webhookRoutes from './routes/webhookRoutes';
import { iniciarCronJobs } from './utils/cronJobs';

// Configuración
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Compresi\u00f3n gzip
app.use(compression());

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL,
  'https://rifasg.vercel.app',
  'http://localhost:5173'
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Para webhooks, usar raw body
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Para el resto, usar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (comprobantes)
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png') || filePath.endsWith('.webp') || filePath.endsWith('.gif')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Rutas
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API de Rifa - Sistema de Venta de Boletas',
    version: '1.0.0',
    endpoints: {
      boletas: '/api/boletas',
      pagos: '/api/pagos',
      webhooks: '/api/webhooks'
    }
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/boletas', boletaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/webhooks', webhookRoutes);

// Manejo de errores 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor
async function iniciarServidor() {
  try {
    // Validar configuración sensible en producción
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.ADMIN_SECRET_KEY || process.env.ADMIN_SECRET_KEY === 'admin123') {
        console.warn('⚠️  ADMIN_SECRET_KEY no configurada o usa el valor por defecto. Cámbiala en producción.');
      }
      if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI no configurada');
        process.exit(1);
      }
    }

    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar cron jobs
    iniciarCronJobs();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\nServidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación: http://localhost:${PORT}/\n`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();

export default app;
