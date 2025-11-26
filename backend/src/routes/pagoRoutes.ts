import { Router } from 'express';
import { PagoController } from '../controllers/pagoController';

const router = Router();

// POST /api/pagos/crear-preferencia - Crear preferencia de Mercado Pago
router.post('/crear-preferencia', PagoController.crearPreferencia);

// GET /api/pagos/:transactionId - Consultar estado de un pago
router.get('/:transactionId', PagoController.consultarPago);

export default router;
