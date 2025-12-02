import mongoose, { Schema, Document } from 'mongoose';
import { IPago, PagoEstado } from '../types';

export interface IPagoDocument extends IPago, Document {}

const pagoSchema = new Schema<IPagoDocument>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    boletaNumero: {
      type: String,
      required: true,
      ref: 'Boleta'
    },
    monto: {
      type: Number,
      required: true
    },
    estado: {
      type: String,
      enum: Object.values(PagoEstado),
      default: PagoEstado.PENDING,
      required: true
    },
    usuario: {
      nombre: { type: String, required: true },
      telefono: { type: String, required: true }
    },
    mercadoPagoData: {
      type: Schema.Types.Mixed
    },
    preferenceId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Índices (transactionId ya tiene unique: true, no necesita index adicional)
pagoSchema.index({ boletaNumero: 1 });
pagoSchema.index({ estado: 1 });

export const Pago = mongoose.model<IPagoDocument>('Pago', pagoSchema);
