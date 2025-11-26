import { Request, Response } from 'express';
import { Boleta } from '../models/Boleta';
import { Pago } from '../models/Pago';
import { BoletaEstado, PagoEstado } from '../types';

export class BoletaController {
  // Listar todas las boletas
  static async listarBoletas(req: Request, res: Response) {
    try {
      const boletas = await Boleta.find().sort({ numero: 1 }).select('-__v');
      
      res.json({
        success: true,
        data: boletas
      });
    } catch (error) {
      console.error('Error al listar boletas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener boletas'
      });
    }
  }

  // Reservar una boleta
  static async reservarBoleta(req: Request, res: Response) {
    try {
      const { numero } = req.params;
      const { nombre, telefono } = req.body;
      const comprobante = (req as any).file; // Archivo subido con multer

      if (!nombre || !telefono) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y teléfono son requeridos'
        });
      }

      const boletaNum = parseInt(numero);
      if (isNaN(boletaNum) || boletaNum < 1 || boletaNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Número de boleta inválido'
        });
      }

      // Buscar la boleta
      const boleta = await Boleta.findOne({ numero: boletaNum });
      
      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      // Verificar que esté disponible
      if (boleta.estado !== BoletaEstado.DISPONIBLE) {
        return res.status(400).json({
          success: false,
          message: 'Esta boleta ya no está disponible'
        });
      }

      // Si hay comprobante, marcar como PAGADA, si no como RESERVADA
      const nuevoEstado = comprobante ? BoletaEstado.PAGADA : BoletaEstado.RESERVADA;

      boleta.estado = nuevoEstado;
      boleta.usuario = { nombre, telefono };
      boleta.reservadaHasta = undefined; // Las reservas ahora son permanentes hasta que admin las libere
      
      // Guardar URL del comprobante si existe
      if (comprobante) {
        boleta.comprobanteUrl = `/uploads/${comprobante.filename}`;
      }
      
      await boleta.save();

      res.json({
        success: true,
        data: {
          numero: boleta.numero,
          estado: boleta.estado,
          precio: 20000
        },
        message: comprobante 
          ? 'Boleta marcada como PAGADA. Un administrador verificará el comprobante.'
          : 'Boleta RESERVADA. Realiza la transferencia y actualiza con el comprobante.'
      });
    } catch (error) {
      console.error('Error al reservar boleta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al reservar boleta'
      });
    }
  }

  // Obtener detalles de una boleta
  static async obtenerBoleta(req: Request, res: Response) {
    try {
      const { numero } = req.params;
      const boleta = await Boleta.findOne({ numero: parseInt(numero) });

      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      res.json({
        success: true,
        data: boleta
      });
    } catch (error) {
      console.error('Error al obtener boleta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener boleta'
      });
    }
  }

  // Liberar reservas expiradas
  static async liberarReservasExpiradas() {
    try {
      const ahora = new Date();
      
      const resultado = await Boleta.updateMany(
        {
          estado: BoletaEstado.RESERVADA,
          reservadaHasta: { $lt: ahora }
        },
        {
          $set: {
            estado: BoletaEstado.DISPONIBLE,
            reservadaHasta: null,
            usuario: null
          }
        }
      );

      if (resultado.modifiedCount > 0) {
        console.log(`✅ Se liberaron ${resultado.modifiedCount} boletas expiradas`);
      }

      return resultado.modifiedCount;
    } catch (error) {
      console.error('❌ Error al liberar reservas expiradas:', error);
      return 0;
    }
  }

  // Estadísticas
  static async obtenerEstadisticas(req: Request, res: Response) {
    try {
      const [disponibles, reservadas, pagadas, totalRecaudado] = await Promise.all([
        Boleta.countDocuments({ estado: BoletaEstado.DISPONIBLE }),
        Boleta.countDocuments({ estado: BoletaEstado.RESERVADA }),
        Boleta.countDocuments({ estado: BoletaEstado.PAGADA }),
        Pago.aggregate([
          { $match: { estado: PagoEstado.APPROVED } },
          { $group: { _id: null, total: { $sum: '$monto' } } }
        ])
      ]);

      res.json({
        success: true,
        data: {
          disponibles,
          reservadas,
          pagadas,
          total: 100,
          recaudado: totalRecaudado[0]?.total || 0
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas'
      });
    }
  }

  // Panel de administración (protegido por secreto)
  static async obtenerBoletasAdmin(req: Request, res: Response) {
    try {
      const { secretKey } = req.params;
      const adminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';

      // Verificar secreto
      if (secretKey !== adminSecret) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      // Obtener boletas vendidas y reservadas con datos de usuario
      const boletas = await Boleta.find({
        estado: { $in: [BoletaEstado.RESERVADA, BoletaEstado.PAGADA] }
      })
        .sort({ numero: 1 })
        .select('-__v');

      res.json({
        success: true,
        data: boletas
      });
    } catch (error) {
      console.error('Error al obtener boletas admin:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos de administración'
      });
    }
  }

  // Marcar boleta como pagada (admin)
  static async marcarComoPagada(req: Request, res: Response) {
    try {
      const { numero, secretKey } = req.params;
      const adminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';

      if (secretKey !== adminSecret) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      const boleta = await Boleta.findOne({ numero: parseInt(numero) });
      
      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      boleta.estado = BoletaEstado.PAGADA;
      await boleta.save();

      res.json({
        success: true,
        data: boleta,
        message: 'Boleta marcada como PAGADA'
      });
    } catch (error) {
      console.error('Error al marcar como pagada:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar boleta'
      });
    }
  }

  // Liberar reserva (admin)
  static async liberarReserva(req: Request, res: Response) {
    try {
      const { numero, secretKey } = req.params;
      const adminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';

      if (secretKey !== adminSecret) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      const boleta = await Boleta.findOne({ numero: parseInt(numero) });
      
      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      boleta.estado = BoletaEstado.DISPONIBLE;
      boleta.usuario = undefined;
      boleta.reservadaHasta = undefined;
      boleta.comprobanteUrl = undefined;
      await boleta.save();

      res.json({
        success: true,
        data: boleta,
        message: 'Reserva liberada exitosamente'
      });
    } catch (error) {
      console.error('Error al liberar reserva:', error);
      res.status(500).json({
        success: false,
        message: 'Error al liberar reserva'
      });
    }
  }

  // Cambiar estado de pagada a reservada (admin)
  static async cambiarAReservada(req: Request, res: Response) {
    try {
      const { numero, secretKey } = req.params;
      const adminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';

      if (secretKey !== adminSecret) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      const boleta = await Boleta.findOne({ numero: parseInt(numero) });
      
      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      boleta.estado = BoletaEstado.RESERVADA;
      await boleta.save();

      res.json({
        success: true,
        data: boleta,
        message: 'Boleta cambiada a RESERVADA'
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar boleta'
      });
    }
  }
}
