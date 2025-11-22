import { Request, Response } from 'express';
import crypto from 'crypto';
import { Boleta } from '../models/Boleta';
import { Pago } from '../models/Pago';
import { BoletaEstado, PagoEstado, WompiWebhookPayload } from '../types';

export class PagoController {
  // Crear intención de pago
  static async crearIntencionPago(req: Request, res: Response) {
    try {
      const { boletaNumero, nombre, telefono } = req.body;

      if (!boletaNumero || !nombre || !telefono) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      // Verificar que la boleta esté reservada
      const boleta = await Boleta.findOne({ numero: boletaNumero });
      
      if (!boleta) {
        return res.status(404).json({
          success: false,
          message: 'Boleta no encontrada'
        });
      }

      if (boleta.estado !== BoletaEstado.RESERVADA) {
        return res.status(400).json({
          success: false,
          message: 'La boleta no está reservada o ya fue vendida'
        });
      }

      // Crear registro de pago pendiente
      const transactionId = `BOLETA-${boletaNumero}-${Date.now()}`;
      
      const pago = new Pago({
        transactionId,
        boletaNumero,
        monto: 10000,
        estado: PagoEstado.PENDING,
        usuario: { nombre, telefono }
      });

      await pago.save();

      // Actualizar boleta con el ID de pago
      boleta.pagoId = transactionId;
      await boleta.save();

      // En producción, aquí crearías la transacción con Wompi
      // Por ahora devolvemos la información básica
      res.json({
        success: true,
        data: {
          transactionId,
          boletaNumero,
          monto: 10000,
          paymentUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago/${transactionId}`
        }
      });
    } catch (error) {
      console.error('Error al crear intención de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud de pago'
      });
    }
  }

  // Webhook de Wompi
  static async procesarWebhook(req: Request, res: Response) {
    try {
      const payload: WompiWebhookPayload = req.body;
      
      // Validar firma del webhook
      const isValid = PagoController.validarFirmaWompi(payload);
      
      if (!isValid) {
        console.error('❌ Firma de webhook inválida');
        return res.status(401).json({
          success: false,
          message: 'Firma inválida'
        });
      }

      // Procesar el evento
      if (payload.event === 'transaction.updated') {
        const transaction = payload.data.transaction;
        const reference = transaction.reference; // Nuestro transactionId
        
        // Buscar el pago
        const pago = await Pago.findOne({ transactionId: reference });
        
        if (!pago) {
          console.error(`❌ Pago no encontrado: ${reference}`);
          return res.status(404).json({
            success: false,
            message: 'Pago no encontrado'
          });
        }

        // Actualizar estado según la transacción
        if (transaction.status === 'APPROVED') {
          await PagoController.confirmarPago(pago.transactionId, transaction);
        } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
          await PagoController.rechazarPago(pago.transactionId, transaction);
        }
      }

      // Wompi espera un 200 OK
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error procesando webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook'
      });
    }
  }

  // Confirmar pago exitoso
  private static async confirmarPago(transactionId: string, wompiData: any) {
    try {
      const pago = await Pago.findOne({ transactionId });
      
      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      // Actualizar pago
      pago.estado = PagoEstado.APPROVED;
      pago.wompiData = wompiData;
      await pago.save();

      // Actualizar boleta a PAGADA
      const boleta = await Boleta.findOne({ numero: pago.boletaNumero });
      
      if (boleta) {
        boleta.estado = BoletaEstado.PAGADA;
        boleta.reservadaHasta = undefined;
        await boleta.save();
        
        console.log(`✅ Pago confirmado - Boleta #${pago.boletaNumero}`);
      }
    } catch (error) {
      console.error('Error confirmando pago:', error);
      throw error;
    }
  }

  // Rechazar pago
  private static async rechazarPago(transactionId: string, wompiData: any) {
    try {
      const pago = await Pago.findOne({ transactionId });
      
      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      // Actualizar pago
      pago.estado = PagoEstado.DECLINED;
      pago.wompiData = wompiData;
      await pago.save();

      // Liberar la boleta
      const boleta = await Boleta.findOne({ numero: pago.boletaNumero });
      
      if (boleta) {
        boleta.estado = BoletaEstado.DISPONIBLE;
        boleta.reservadaHasta = undefined;
        boleta.usuario = undefined;
        boleta.pagoId = undefined;
        await boleta.save();
        
        console.log(`⚠️ Pago rechazado - Boleta #${pago.boletaNumero} liberada`);
      }
    } catch (error) {
      console.error('Error rechazando pago:', error);
      throw error;
    }
  }

  // Validar firma de Wompi
  private static validarFirmaWompi(payload: WompiWebhookPayload): boolean {
    try {
      const eventSecret = process.env.WOMPI_EVENT_SECRET;
      
      if (!eventSecret) {
        console.error('❌ WOMPI_EVENT_SECRET no configurado');
        return false;
      }

      // Construir el string a firmar según la documentación de Wompi
      const { checksum, properties } = payload.signature;
      
      let stringToSign = '';
      properties.forEach((prop) => {
        const keys = prop.split('.');
        let value = payload as any;
        
        keys.forEach((key) => {
          value = value[key];
        });
        
        stringToSign += value;
      });

      stringToSign += payload.timestamp + eventSecret;

      // Calcular hash
      const hash = crypto.createHash('sha256').update(stringToSign).digest('hex');

      return hash === checksum;
    } catch (error) {
      console.error('Error validando firma:', error);
      return false;
    }
  }

  // Consultar estado de un pago
  static async consultarPago(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      
      const pago = await Pago.findOne({ transactionId });
      
      if (!pago) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: pago
      });
    } catch (error) {
      console.error('Error consultando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar pago'
      });
    }
  }
}
