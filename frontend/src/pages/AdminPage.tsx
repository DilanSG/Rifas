import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Clock, User, Phone, Hash, Calendar, Image as ImageIcon, XCircle, Check } from 'lucide-react';
import axios from 'axios';
import { boletaService } from '../services/api';

interface BoletaAdmin {
  _id: string;
  numero: number;
  estado: 'disponible' | 'reservada' | 'pagada';
  usuario?: {
    nombre: string;
    telefono: string;
  };
  comprobanteUrl?: string;
  reservadaHasta?: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminPage = () => {
  const { secretKey } = useParams<{ secretKey: string }>();
  const navigate = useNavigate();
  const [boletas, setBoletas] = useState<BoletaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);

  useEffect(() => {
    cargarBoletasAdmin();
  }, [secretKey]);

  const cargarBoletasAdmin = async () => {
    if (!secretKey) {
      setError('Código de acceso inválido');
      setLoading(false);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${backendUrl}/api/boletas/admin/${secretKey}`);
      
      if (response.data.success) {
        setBoletas(response.data.data);
        setError(null);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Acceso denegado. Código incorrecto.');
      } else {
        setError('Error al cargar los datos. Intenta nuevamente.');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Pagada
          </span>
        );
      case 'reservada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <Clock className="w-3 h-3" />
            Reservada
          </span>
        );
      default:
        return null;
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarcarPagada = async (numero: number) => {
    if (!secretKey) return;
    
    setProcesando(numero);
    try {
      await boletaService.marcarComoPagada(numero, secretKey);
      await cargarBoletasAdmin();
    } catch (err) {
      alert('Error al marcar como pagada');
      console.error(err);
    } finally {
      setProcesando(null);
    }
  };

  const handleLiberarReserva = async (numero: number) => {
    if (!secretKey) return;
    if (!confirm(`¿Estás seguro de liberar la boleta #${numero}?`)) return;
    
    setProcesando(numero);
    try {
      await boletaService.liberarReserva(numero, secretKey);
      await cargarBoletasAdmin();
    } catch (err) {
      alert('Error al liberar reserva');
      console.error(err);
    } finally {
      setProcesando(null);
    }
  };

  const handleCambiarAReservada = async (numero: number) => {
    if (!secretKey) return;
    if (!confirm(`¿Cambiar boleta #${numero} a RESERVADA? (comprobante no válido)`)) return;
    
    setProcesando(numero);
    try {
      await boletaService.cambiarAReservada(numero, secretKey);
      await cargarBoletasAdmin();
    } catch (err) {
      alert('Error al cambiar estado');
      console.error(err);
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-300">
            Boletas vendidas y reservadas
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Boletas Pagadas</p>
                <p className="text-3xl font-black text-white">
                  {boletas.filter(b => b.estado === 'pagada').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm mb-1">Boletas Reservadas</p>
                <p className="text-3xl font-black text-white">
                  {boletas.filter(b => b.estado === 'reservada').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Tabla de boletas */}
        {boletas.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <p className="text-gray-400">No hay boletas vendidas o reservadas aún</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl border border-gray-700/50 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Comprobante
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {boletas.map((boleta) => (
                    <tr key={boleta._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-white">{boleta.numero}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getEstadoBadge(boleta.estado)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-200">{boleta.usuario?.nombre || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-200">{boleta.usuario?.telefono || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {boleta.comprobanteUrl ? (
                          <button
                            onClick={() => setComprobanteModal(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${boleta.comprobanteUrl}`)}
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Ver
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin comprobante</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">
                            {formatearFecha(boleta.updatedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {boleta.estado === 'reservada' && (
                            <button
                              onClick={() => handleMarcarPagada(boleta.numero)}
                              disabled={procesando === boleta.numero}
                              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-xs font-medium border border-green-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Pagada
                            </button>
                          )}
                          {boleta.estado === 'pagada' && (
                            <button
                              onClick={() => handleCambiarAReservada(boleta.numero)}
                              disabled={procesando === boleta.numero}
                              className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-xs font-medium border border-yellow-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              Reservada
                            </button>
                          )}
                          <button
                            onClick={() => handleLiberarReserva(boleta.numero)}
                            disabled={procesando === boleta.numero}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-medium border border-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Liberar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-white/10">
              {boletas.map((boleta) => (
                <div key={boleta._id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-white text-lg">#{boleta.numero}</span>
                    </div>
                    {getEstadoBadge(boleta.estado)}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-200">{boleta.usuario?.nombre || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-200">{boleta.usuario?.telefono || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{formatearFecha(boleta.updatedAt)}</span>
                    </div>

                    {boleta.comprobanteUrl && (
                      <button
                        onClick={() => setComprobanteModal(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${boleta.comprobanteUrl}`)}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Ver comprobante
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {boleta.estado === 'reservada' && (
                      <button
                        onClick={() => handleMarcarPagada(boleta.numero)}
                        disabled={procesando === boleta.numero}
                        className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-xs font-medium border border-green-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Marcar Pagada
                      </button>
                    )}
                    {boleta.estado === 'pagada' && (
                      <button
                        onClick={() => handleCambiarAReservada(boleta.numero)}
                        disabled={procesando === boleta.numero}
                        className="flex-1 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-xs font-medium border border-yellow-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        A Reservada
                      </button>
                    )}
                    <button
                      onClick={() => handleLiberarReserva(boleta.numero)}
                      disabled={procesando === boleta.numero}
                      className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-medium border border-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Liberar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Comprobante */}
        {comprobanteModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setComprobanteModal(null)}
          >
            <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setComprobanteModal(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <XCircle className="w-8 h-8" />
              </button>
              <img 
                src={comprobanteModal} 
                alt="Comprobante de pago" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};
