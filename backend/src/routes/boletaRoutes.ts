import { Router } from 'express';
import { BoletaController } from '../controllers/boletaController';
import { upload } from '../config/multer';

const router = Router();

// GET /api/boletas - Listar todas las boletas
router.get('/', BoletaController.listarBoletas);

// GET /api/boletas/estadisticas - Obtener estadísticas
router.get('/estadisticas', BoletaController.obtenerEstadisticas);

// GET /api/boletas/resultados - Obtener resultados del sorteo
router.get('/resultados', BoletaController.obtenerResultados);

// GET /api/boletas/sorteo - Verificar estado del sorteo
router.get('/sorteo', BoletaController.verificarSorteo);

// GET /api/boletas/admin/:secretKey - Panel de administración (protegido)
router.get('/admin/:secretKey', BoletaController.obtenerBoletasAdmin);

// POST /api/boletas/admin/:secretKey/finalizar-sorteo - Finalizar sorteo
router.post('/admin/:secretKey/finalizar-sorteo', BoletaController.finalizarSorteo);

// POST /api/boletas/admin/:secretKey/:numero/marcar-pagada - Marcar como pagada
router.post('/admin/:secretKey/:numero/marcar-pagada', BoletaController.marcarComoPagada);

// POST /api/boletas/admin/:secretKey/:numero/liberar-reserva - Liberar reserva
router.post('/admin/:secretKey/:numero/liberar-reserva', BoletaController.liberarReserva);

// POST /api/boletas/admin/:secretKey/:numero/cambiar-reservada - Cambiar a reservada
router.post('/admin/:secretKey/:numero/cambiar-reservada', BoletaController.cambiarAReservada);

// GET /api/boletas/:numero - Obtener una boleta específica
router.get('/:numero', BoletaController.obtenerBoleta);

// POST /api/boletas/:numero/reservar - Reservar una boleta (con upload opcional de comprobante)
router.post('/:numero/reservar', upload.single('comprobante'), BoletaController.reservarBoleta);

export default router;
