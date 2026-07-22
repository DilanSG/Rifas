import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Boleta } from '../models/Boleta';
import { Pago } from '../models/Pago';
import { BoletaEstado, PagoEstado, MercadoPagoNotification, PRECIO_BOLETA } from '../types';

function getMercadoPagoClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token });
}

export class PagoController {
  static async crearPreferencia(req: Request, res: Response) {
    try {
      const client = getMercadoPagoClient();
      if (!client) {
        return res.status(503).json({
          success: false,
          message: 'Pago en línea no disponible. Usa el método de transferencia manual.'
        });
      }

      const { boletaNumero, nombre, telefono } = req.body;

      if (!boletaNumero || !nombre || !telefono) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

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

      const transactionId = `BOLETA-${boletaNumero}-${Date.now()}`;
      
      const pago = new Pago({
        transactionId,
        boletaNumero,
        monto: PRECIO_BOLETA,
        estado: PagoEstado.PENDING,
        usuario: { nombre, telefono }
      });

      await pago.save();

      boleta.pagoId = transactionId;
      await boleta.save();

      const preference = new Preference(client);
      const preferenceData = await preference.create({
        body: {
          items: [
            {
              id: boletaNumero.toString(),
              title: `Boleta #${boletaNumero}`,
              quantity: 1,
              unit_price: PRECIO_BOLETA,
              currency_id: 'COP'
            }
          ],
          external_reference: transactionId
        }
      });

      pago.preferenceId = preferenceData.id;
      await pago.save();

      res.json({
        success: true,
        data: {
          preferenceId: preferenceData.id,
          transactionId,
          boletaNumero,
          monto: PRECIO_BOLETA
        }
      });
    } catch (error: any) {
      console.error('Error al crear preferencia:', {
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
      });
    }
  }

  static async procesarWebhook(req: Request, res: Response) {
    try {
      const client = getMercadoPagoClient();
      if (!client) {
        return res.status(200).json({ success: true });
      }

      const notification: MercadoPagoNotification = req.body;
      
      console.log('Notificación de Mercado Pago:', notification);

      if (notification.type === 'payment') {
        const paymentId = notification.data.id;
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });

        console.log('Datos del pago:', paymentData);

        const externalReference = paymentData.external_reference;
        
        if (!externalReference) {
          console.error('No se encontró external_reference');
          return res.status(200).json({ success: true });
        }

        const pago = await Pago.findOne({ transactionId: externalReference });
        
        if (!pago) {
          console.error(`Pago no encontrado: ${externalReference}`);
          return res.status(200).json({ success: true });
        }

        if (paymentData.status === 'approved') {
          await PagoController.confirmarPago(pago.transactionId, paymentData);
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          await PagoController.rechazarPago(pago.transactionId, paymentData);
        } else if (paymentData.status === 'pending' || paymentData.status === 'in_process') {
          pago.mercadoPagoData = paymentData;
          await pago.save();
          console.log(`Pago pendiente - Boleta #${pago.boletaNumero}`);
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error procesando webhook:', error);
      res.status(200).json({ success: true });
    }
  }

  private static async confirmarPago(transactionId: string, mercadoPagoData: any) {
    try {
      const pago = await Pago.findOne({ transactionId });
      
      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      pago.estado = PagoEstado.APPROVED;
      pago.mercadoPagoData = mercadoPagoData;
      await pago.save();

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

  private static async rechazarPago(transactionId: string, mercadoPagoData: any) {
    try {
      const pago = await Pago.findOne({ transactionId });
      
      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      pago.estado = PagoEstado.DECLINED;
      pago.mercadoPagoData = mercadoPagoData;
      await pago.save();

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
