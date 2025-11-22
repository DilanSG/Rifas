import cron from 'node-cron';
import { BoletaController } from '../controllers/boletaController';

export function iniciarCronJobs() {
  // Ejecutar cada minuto para liberar reservas expiradas
  cron.schedule('* * * * *', async () => {
    await BoletaController.liberarReservasExpiradas();
  });

  console.log('✅ Cron jobs iniciados - Liberación automática de reservas activa');
}
