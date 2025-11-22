import { Router } from 'express';
import { BoletaController } from '../controllers/boletaController';

const router = Router();

// GET /api/boletas - Listar todas las boletas
router.get('/', BoletaController.listarBoletas);

// GET /api/boletas/estadisticas - Obtener estadísticas
router.get('/estadisticas', BoletaController.obtenerEstadisticas);

// GET /api/boletas/:numero - Obtener una boleta específica
router.get('/:numero', BoletaController.obtenerBoleta);

// POST /api/boletas/:numero/reservar - Reservar una boleta
router.post('/:numero/reservar', BoletaController.reservarBoleta);

export default router;
