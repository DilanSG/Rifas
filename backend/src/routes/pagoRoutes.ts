import { Router } from 'express';
import { PagoController } from '../controllers/pagoController';

const router = Router();

// POST /api/pagos/crear - Crear intención de pago
router.post('/crear', PagoController.crearIntencionPago);

// GET /api/pagos/:transactionId - Consultar estado de un pago
router.get('/:transactionId', PagoController.consultarPago);

export default router;
