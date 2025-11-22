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
  numero: number;
  estado: BoletaEstado;
  usuario?: IUsuarioData;
  reservadaHasta?: Date;
  pagoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPago {
  transactionId: string;
  boletaNumero: number;
  monto: number;
  estado: PagoEstado;
  usuario: IUsuarioData;
  wompiData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface WompiWebhookPayload {
  event: string;
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      customer_email?: string;
      payment_method_type?: string;
      status: string;
      status_message?: string;
      created_at: string;
    };
  };
  sent_at: string;
  timestamp: number;
  signature: {
    checksum: string;
    properties: string[];
  };
}
