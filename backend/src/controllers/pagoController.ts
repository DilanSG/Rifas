import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Boleta } from '../models/Boleta';
import { Pago } from '../models/Pago';
import { BoletaEstado, PagoEstado, MercadoPagoNotification } from '../types';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

export class PagoController {
  // Crear preferencia de pago con Mercado Pago
  static async crearPreferencia(req: Request, res: Response) {
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
        monto: 20000,
        estado: PagoEstado.PENDING,
        usuario: { nombre, telefono }
      });

      await pago.save();

      // Actualizar boleta con el ID de pago
      boleta.pagoId = transactionId;
      await boleta.save();

      // Crear preferencia de Mercado Pago - Versión simplificada
      const preference = new Preference(client);
      
      console.log('Creando preferencia con Access Token:', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 20) + '...');
      
      const preferenceData = await preference.create({
        body: {
          items: [
            {
              id: boletaNumero.toString(),
              title: `Boleta #${boletaNumero}`,
              quantity: 1,
              unit_price: 20000,
              currency_id: 'COP'
            }
          ],
          external_reference: transactionId
        }
      });

      // Guardar preferenceId en el pago
      pago.preferenceId = preferenceData.id;
      await pago.save();

      res.json({
        success: true,
        data: {
          preferenceId: preferenceData.id,
          transactionId,
          boletaNumero,
          monto: 20000
        }
      });
    } catch (error: any) {
      console.error('Error completo al crear preferencia:', {
        message: error.message,
        status: error.status,
        code: error.code,
        cause: error.cause,
        apiResponse: error.apiResponse
      });
      
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud de pago',
        error: error.message || 'Error desconocido',
        details: error.cause || error.apiResponse
      });
    }
  }

  // Webhook de Mercado Pago
  static async procesarWebhook(req: Request, res: Response) {
    try {
      const notification: MercadoPagoNotification = req.body;
      
      console.log('Notificación de Mercado Pago:', notification);

      // Mercado Pago envía diferentes tipos de notificaciones
      if (notification.type === 'payment') {
        const paymentId = notification.data.id;
        
        // Consultar el pago en Mercado Pago
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });

        console.log('Datos del pago:', paymentData);

        const externalReference = paymentData.external_reference; // Nuestro transactionId
        
        if (!externalReference) {
          console.error('No se encontró external_reference');
          return res.status(200).json({ success: true });
        }

        // Buscar el pago en nuestra base de datos
        const pago = await Pago.findOne({ transactionId: externalReference });
        
        if (!pago) {
          console.error(`Pago no encontrado: ${externalReference}`);
          return res.status(200).json({ success: true });
        }

        // Procesar según el estado del pago
        if (paymentData.status === 'approved') {
          await PagoController.confirmarPago(pago.transactionId, paymentData);
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          await PagoController.rechazarPago(pago.transactionId, paymentData);
        } else if (paymentData.status === 'pending' || paymentData.status === 'in_process') {
          // Actualizar con los datos pero mantener pendiente
          pago.mercadoPagoData = paymentData;
          await pago.save();
          console.log(`Pago pendiente - Boleta #${pago.boletaNumero}`);
        }
      }

      // Mercado Pago espera un 200 OK
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error procesando webhook:', error);
      // Siempre devolver 200 para que MP no reintente
      res.status(200).json({ success: true });
    }
  }

  // Confirmar pago exitoso
  private static async confirmarPago(transactionId: string, mercadoPagoData: any) {
    try {
      const pago = await Pago.findOne({ transactionId });
      
      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      // Actualizar pago
      pago.estado = PagoEstado.APPROVED;
      pago.mercadoPagoData = mercadoPagoData;
      await pago.save();

      // Actualizar boleta a PAGADA
      const boleta = await Boleta.findOne({ numero: pago.boletaNumero });
      
      if (boleta) {
        boleta.estado = BoletaEstado.PAGADA;
        boleta.reservadaHasta = undefined;
        await boleta.save();
        
        console.log(`Pago confirmado - Boleta #${pago.boletaNumero}`);
      }
    } catch (error) {
      console.error('Error confirmando pago:', error);
      throw error;
    }
  }

  // Rechazar pago
  private static async rechazarPago(transactionId: string, mercadoPagoData: any) {
    try {
      const pago = await Pago.findOne({ transactionId });
      
      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      // Actualizar pago
      pago.estado = PagoEstado.DECLINED;
      pago.mercadoPagoData = mercadoPagoData;
      await pago.save();

      // Liberar la boleta
      const boleta = await Boleta.findOne({ numero: pago.boletaNumero });
      
      if (boleta) {
        boleta.estado = BoletaEstado.DISPONIBLE;
        boleta.reservadaHasta = undefined;
        boleta.usuario = undefined;
        boleta.pagoId = undefined;
        await boleta.save();
        
        console.log(`Pago rechazado - Boleta #${pago.boletaNumero} liberada`);
      }
    } catch (error) {
      console.error('Error rechazando pago:', error);
      throw error;
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
