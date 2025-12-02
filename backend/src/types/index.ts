export enum BoletaEstado {
  DISPONIBLE = 'disponible',
  RESERVADA = 'reservada',
  PAGADA = 'pagada'
}

export enum PagoEstado {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  ERROR = 'error'
}

export interface IUsuarioData {
  nombre: string;
  telefono: string;
}

export interface IBoleta {
  numero: string;
  estado: BoletaEstado;
  usuario?: IUsuarioData;
  reservadaHasta?: Date;
  pagoId?: string;
  comprobanteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPago {
  transactionId: string;
  boletaNumero: string;
  monto: number;
  estado: PagoEstado;
  usuario: IUsuarioData;
  mercadoPagoData?: any;
  preferenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MercadoPagoNotification {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: string;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}
