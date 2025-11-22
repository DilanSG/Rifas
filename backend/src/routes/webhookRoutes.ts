import { Router } from 'express';
import { PagoController } from '../controllers/pagoController';

const router = Router();

// POST /api/webhooks/wompi - Webhook de Wompi
router.post('/wompi', PagoController.procesarWebhook);

export default router;
