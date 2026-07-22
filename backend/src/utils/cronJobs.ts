import cron from 'node-cron';
import { BoletaController } from '../controllers/boletaController';

export function iniciarCronJobs() {
  // Liberar reservas expiradas cada minuto
  cron.schedule('* * * * *', async () => {
    await BoletaController.liberarReservasExpiradas();
  });

  console.log('✅ Cron jobs iniciados');
}
