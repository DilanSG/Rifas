import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { BoletaController } from '../controllers/boletaController';
import { upload } from '../config/multer';

const router = Router();

const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'La imagen no debe superar los 5MB'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Solo se permiten archivos de imagen (jpg, png, gif, webp)'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error al subir el archivo'
        });
    }
  }
  next(err);
};

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
router.post('/:numero/reservar', upload.single('comprobante'), handleMulterError, BoletaController.reservarBoleta);

export default router;
