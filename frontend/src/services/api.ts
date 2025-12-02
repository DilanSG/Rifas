import axios from 'axios';
import { Boleta, ReservaRequest, PagoRequest, Estadisticas } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const boletaService = {
  // Obtener todas las boletas
  obtenerBoletas: async (): Promise<Boleta[]> => {
    const response = await api.get('/boletas');
    return response.data.data;
  },

  // Obtener una boleta específica
  obtenerBoleta: async (numero: string): Promise<Boleta> => {
    const response = await api.get(`/boletas/${numero}`);
    return response.data.data;
  },

  // Reservar una boleta con comprobante opcional
  reservarBoleta: async (numero: string, datos: ReservaRequest, comprobante?: File) => {
    const formData = new FormData();
    formData.append('nombre', datos.nombre);
    formData.append('telefono', datos.telefono);
    
    if (comprobante) {
      formData.append('comprobante', comprobante);
    }

    const response = await axios.post(
      `${API_URL}/boletas/${numero}/reservar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Obtener estadísticas
  obtenerEstadisticas: async (): Promise<Estadisticas> => {
    const response = await api.get('/boletas/estadisticas');
    return response.data.data;
  },

  // Obtener resultados del sorteo
  obtenerResultados: async () => {
    const response = await api.get('/boletas/resultados');
    return response.data;
  },

  // Verificar estado del sorteo
  verificarSorteo: async () => {
    const response = await api.get('/boletas/sorteo');
    return response.data;
  },

  // Admin: Finalizar sorteo
  finalizarSorteo: async (secretKey: string, numeroGanador: string) => {
    const response = await api.post(`/boletas/admin/${secretKey}/finalizar-sorteo`, {
      numeroGanador
    });
    return response.data;
  },

  // Admin: Marcar como pagada
  marcarComoPagada: async (numero: string, secretKey: string) => {
    const response = await api.post(`/boletas/admin/${secretKey}/${numero}/marcar-pagada`);
    return response.data;
  },

  // Admin: Liberar reserva
  liberarReserva: async (numero: string, secretKey: string) => {
    const response = await api.post(`/boletas/admin/${secretKey}/${numero}/liberar-reserva`);
    return response.data;
  },

  // Admin: Cambiar a reservada
  cambiarAReservada: async (numero: string, secretKey: string) => {
    const response = await api.post(`/boletas/admin/${secretKey}/${numero}/cambiar-reservada`);
    return response.data;
  },
};

export const pagoService = {
  // Crear preferencia de pago con Mercado Pago
  crearPreferencia: async (datos: PagoRequest) => {
    const response = await api.post('/pagos/crear-preferencia', datos);
    return response.data;
  },

  // Consultar estado de pago
  consultarPago: async (transactionId: string) => {
    const response = await api.get(`/pagos/${transactionId}`);
    return response.data;
  },
};

export default api;
