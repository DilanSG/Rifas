import mongoose, { Schema, Document } from 'mongoose';

export interface ISorteo {
  finalizado: boolean;
  numeroGanador?: string;
  fechaFinalizacion?: Date;
}

export interface ISorteoDocument extends ISorteo, Document {}

const sorteoSchema = new Schema<ISorteoDocument>(
  {
    finalizado: {
      type: Boolean,
      default: false,
      required: true
    },
    numeroGanador: {
      type: String,
      match: /^\d{2}$/  // Validar formato 00-99
    },
    fechaFinalizacion: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Sorteo = mongoose.model<ISorteoDocument>('Sorteo', sorteoSchema);
