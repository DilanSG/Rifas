import { Request, Response } from 'express';
import { Boleta } from '../models/Boleta';
import { Pago } from '../models/Pago';
import { Sorteo } from '../models/Sorteo';
import { BoletaEstado, PagoEstado } from '../types';
import { cacheService } from '../utils/cache';

export class BoletaController {
  // Listar todas las boletas
  static async listarBoletas(req: Request, res: Response) {
    try {
      // Intentar obtener del caché
      const cached = cacheService.get('boletas');
      if (cached) {
        return res.json({
          success: true,
          data: cached
        });
      }

      const boletas = await Boleta.find()
        .sort({ numero: 1 })
        .select('-__v')
        .lean()
        .exec();
      
      // Guardar en caché
      cacheService.set('boletas', boletas);
      
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

      // Validar formato 00-99
      if (!/^\d{2}$/.test(numero)) {
        return res.status(400).json({
          success: false,
          message: 'Número de boleta inválido (debe ser 00-99)'
        });
      }

      // Buscar la boleta
      const boleta = await Boleta.findOne({ numero });
      
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

      // Invalidar caché
      cacheService.invalidate('boletas');

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
      
      // Validar formato 00-99
      if (!/^\d{2}$/.test(numero)) {
        return res.status(400).json({
          success: false,
          message: 'Número de boleta inválido (debe ser 00-99)'
        });
      }

      const boleta = await Boleta.findOne({ numero });

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

      const boleta = await Boleta.findOne({ numero });
      
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

      const boleta = await Boleta.findOne({ numero });
      
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

      const boleta = await Boleta.findOne({ numero });
      
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

  // Obtener resultados del sorteo (solo boletas reservadas/pagadas)
  static async obtenerResultados(req: Request, res: Response) {
    try {
      // Obtener estado del sorteo
      let sorteo = await Sorteo.findOne();
      
      const boletas = await Boleta.find({ 
        estado: { $ne: 'disponible' } 
      })
        .sort({ numero: 1 })
        .select('numero estado usuario updatedAt')
        .lean()
        .exec();

      // Función mejorada de censura: mostrar solo primeras 2 letras de cada palabra
      const censurarNombre = (nombre: string): string => {
        if (!nombre) return '';
        const palabras = nombre.trim().split(/\s+/);
        return palabras.map(palabra => {
          if (palabra.length <= 2) return palabra;
          return palabra.substring(0, 2) + '*'.repeat(Math.max(palabra.length - 2, 2));
        }).join(' ');
      };

      const resultados = boletas.map(boleta => {
        const nombre = boleta.usuario?.nombre || '';
        const telefono = boleta.usuario?.telefono || '';
        const nombreCensurado = censurarNombre(nombre);
        const telefonoCensurado = telefono.length > 4 
          ? '*'.repeat(telefono.length - 4) + telefono.slice(-4)
          : '*'.repeat(telefono.length);

        return {
          numero: boleta.numero,
          estado: boleta.estado,
          nombreCensurado,
          telefonoCensurado,
          fechaCompra: boleta.updatedAt
        };
      });

      // Obtener datos del ganador si el sorteo está finalizado
      let ganadorData = null;
      if (sorteo?.finalizado && sorteo.numeroGanador) {
        const boletaGanadora = await Boleta.findOne({ numero: sorteo.numeroGanador });
        
        if (boletaGanadora) {
          const nombreGanador = boletaGanadora.usuario?.nombre || '';
          const telefonoGanador = boletaGanadora.usuario?.telefono || '';
          
          ganadorData = {
            numero: boletaGanadora.numero,
            estado: boletaGanadora.estado,
            nombreCensurado: censurarNombre(nombreGanador),
            telefonoCensurado: telefonoGanador.length > 4 
              ? '*'.repeat(telefonoGanador.length - 4) + telefonoGanador.slice(-4)
              : '*'.repeat(telefonoGanador.length),
            fechaCompra: boletaGanadora.updatedAt,
            vendida: boletaGanadora.estado !== 'disponible'
          };
        } else {
          ganadorData = {
            numero: sorteo.numeroGanador,
            estado: 'disponible',
            nombreCensurado: '',
            telefonoCensurado: '',
            fechaCompra: null,
            vendida: false
          };
        }
      }

      res.json({
        success: true,
        data: {
          resultados,
          sorteoFinalizado: sorteo?.finalizado || false,
          numeroGanador: sorteo?.numeroGanador,
          numeroLoteriaCompleto: sorteo?.numeroLoteriaCompleto,
          fechaFinalizacion: sorteo?.fechaFinalizacion,
          ganador: ganadorData
        }
      });
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resultados del sorteo'
      });
    }
  }

  // Verificar si el sorteo está finalizado
  static async verificarSorteo(req: Request, res: Response) {
    try {
      let sorteo = await Sorteo.findOne();
      
      if (!sorteo) {
        sorteo = await Sorteo.create({ finalizado: false });
      }

      res.json({
        success: true,
        data: {
          finalizado: sorteo.finalizado,
          numeroGanador: sorteo.numeroGanador,
          numeroLoteriaCompleto: sorteo.numeroLoteriaCompleto,
          fechaFinalizacion: sorteo.fechaFinalizacion
        }
      });
    } catch (error) {
      console.error('Error al verificar sorteo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar estado del sorteo'
      });
    }
  }

  // Finalizar sorteo (solo admin)
  static async finalizarSorteo(req: Request, res: Response) {
    try {
      const { secretKey } = req.params;
      const { numeroGanador, numeroLoteriaCompleto } = req.body;

      // Verificar clave secreta
      if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      // Validar número ganador (formato 00-99)
      if (!/^\d{2}$/.test(numeroGanador)) {
        return res.status(400).json({
          success: false,
          message: 'Número ganador inválido (debe ser 00-99)'
        });
      }

      // Validar número completo de lotería (formato 0000-9999)
      if (numeroLoteriaCompleto && !/^\d{4}$/.test(numeroLoteriaCompleto)) {
        return res.status(400).json({
          success: false,
          message: 'Número de lotería inválido (debe ser 4 dígitos)'
        });
      }

      // Verificar que no esté ya finalizado
      let sorteo = await Sorteo.findOne();
      if (sorteo?.finalizado) {
        return res.status(400).json({
          success: false,
          message: 'El sorteo ya ha sido finalizado'
        });
      }

      // Crear o actualizar sorteo
      if (!sorteo) {
        sorteo = new Sorteo();
      }

      sorteo.finalizado = true;
      sorteo.numeroGanador = numeroGanador;
      sorteo.numeroLoteriaCompleto = numeroLoteriaCompleto;
      sorteo.fechaFinalizacion = new Date();
      await sorteo.save();

      // Invalidar caché
      cacheService.invalidate('boletas');

      res.json({
        success: true,
        message: 'Sorteo finalizado exitosamente',
        data: {
          numeroGanador: sorteo.numeroGanador,
          numeroLoteriaCompleto: sorteo.numeroLoteriaCompleto,
          fechaFinalizacion: sorteo.fechaFinalizacion
        }
      });
    } catch (error) {
      console.error('Error al finalizar sorteo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al finalizar sorteo'
      });
    }
  }
}
