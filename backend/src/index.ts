import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { iniciarCronJobs } from './utils/cronJobs';

// Rutas
import boletaRoutes from './routes/boletaRoutes';
import pagoRoutes from './routes/pagoRoutes';
import webhookRoutes from './routes/webhookRoutes';

// Configuración
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Para webhooks, usar raw body
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Para el resto, usar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar cron jobs
    iniciarCronJobs();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Documentación: http://localhost:${PORT}/\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();

export default app;
