import mongoose, { Schema, Document } from 'mongoose';
import { IBoleta, BoletaEstado } from '../types';

export interface IBoletaDocument extends IBoleta, Document {}

const boletaSchema = new Schema<IBoletaDocument>(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{2}$/  // Validar formato 00-99
    },
    estado: {
      type: String,
      enum: Object.values(BoletaEstado),
      default: BoletaEstado.DISPONIBLE,
      required: true
    },
    usuario: {
      nombre: { type: String },
      telefono: { type: String }
    },
    reservadaHasta: {
      type: Date
    },
    pagoId: {
      type: String
    },
    comprobanteUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Índice para búsquedas rápidas
boletaSchema.index({ estado: 1 });
boletaSchema.index({ reservadaHasta: 1 });

export const Boleta = mongoose.model<IBoletaDocument>('Boleta', boletaSchema);
