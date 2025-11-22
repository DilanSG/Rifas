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
      type: Number,
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
    wompiData: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Índices
pagoSchema.index({ transactionId: 1 });
pagoSchema.index({ boletaNumero: 1 });
pagoSchema.index({ estado: 1 });

export const Pago = mongoose.model<IPagoDocument>('Pago', pagoSchema);
