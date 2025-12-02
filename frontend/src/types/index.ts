export enum BoletaEstado {
  DISPONIBLE = 'disponible',
  RESERVADA = 'reservada',
  PAGADA = 'pagada'
}

export interface Boleta {
  _id: string;
  numero: string;
  estado: BoletaEstado;
  usuario?: {
    nombre: string;
    telefono: string;
  };
  reservadaHasta?: string;
  pagoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservaRequest {
  nombre: string;
  telefono: string;
}

export interface PagoRequest {
  boletaNumero: string;
  nombre: string;
  telefono: string;
}

export interface Estadisticas {
  disponibles: number;
  reservadas: number;
  pagadas: number;
  total: number;
  recaudado: number;
}
