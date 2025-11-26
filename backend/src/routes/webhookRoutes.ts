import { Router } from 'express';
import { PagoController } from '../controllers/pagoController';

const router = Router();

// POST /api/webhooks/mercadopago - Webhook de Mercado Pago
router.post('/mercadopago', PagoController.procesarWebhook);

export default router;
