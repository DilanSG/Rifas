import axios from 'axios';
import { Boleta, ReservaRequest, PagoRequest, Estadisticas } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const boletaService = {
  // Obtener todas las boletas
  obtenerBoletas: async (): Promise<Boleta[]> => {
    const response = await api.get('/boletas');
    return response.data.data;
  },

  // Obtener una boleta específica
  obtenerBoleta: async (numero: number): Promise<Boleta> => {
    const response = await api.get(`/boletas/${numero}`);
    return response.data.data;
  },

  // Reservar una boleta
  reservarBoleta: async (numero: number, datos: ReservaRequest) => {
    const response = await api.post(`/boletas/${numero}/reservar`, datos);
    return response.data;
  },

  // Obtener estadísticas
  obtenerEstadisticas: async (): Promise<Estadisticas> => {
    const response = await api.get('/boletas/estadisticas');
    return response.data.data;
  },
};

export const pagoService = {
  // Crear intención de pago
  crearPago: async (datos: PagoRequest) => {
    const response = await api.post('/pagos/crear', datos);
    return response.data;
  },

  // Consultar estado de pago
  consultarPago: async (transactionId: string) => {
    const response = await api.get(`/pagos/${transactionId}`);
    return response.data;
  },
};

export default api;
