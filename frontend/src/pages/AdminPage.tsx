import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Clock, User, Phone, Hash, Calendar, Image as ImageIcon, XCircle, Check, Trophy } from 'lucide-react';
import axios from 'axios';
import { boletaService } from '../services/api';

interface BoletaAdmin {
  _id: string;
  numero: string;
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
  const [procesando, setProcesando] = useState<string | null>(null);
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);
  const [sorteoFinalizado, setSorteoFinalizado] = useState(false);
  const [numeroGanador, setNumeroGanador] = useState<string | null>(null);
  const [numeroLoteriaCompleto, setNumeroLoteriaCompleto] = useState<string | null>(null);
  const [mostrarModalSorteo, setMostrarModalSorteo] = useState(false);
  const [numeroLoteriaInput, setNumeroLoteriaInput] = useState('');

  useEffect(() => {
    cargarBoletasAdmin();
    verificarEstadoSorteo();
  }, [secretKey]);

  const verificarEstadoSorteo = async () => {
    try {
      const response = await boletaService.verificarSorteo();
      if (response.success) {
        setSorteoFinalizado(response.data.finalizado);
        setNumeroGanador(response.data.numeroGanador || null);
        setNumeroLoteriaCompleto(response.data.numeroLoteriaCompleto || null);
      }
    } catch (err) {
      console.error('Error al verificar sorteo:', err);
    }
  };

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

  const handleMarcarPagada = async (numero: string) => {
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

  const handleLiberarReserva = async (numero: string) => {
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

  const handleCambiarAReservada = async (numero: string) => {
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

  const handleFinalizarSorteo = async () => {
    if (!secretKey) return;
    
    const numeroCompleto = numeroLoteriaInput.trim();
    
    // Validar formato 0000-9999 (4 dígitos)
    if (!/^\d{4}$/.test(numeroCompleto)) {
      alert('Por favor ingresa un número válido de 4 dígitos (ejemplo: 3842)');
      return;
    }

    // Extraer los 2 últimos dígitos
    const dosUltimosDigitos = numeroCompleto.slice(-2);

    if (!confirm(`¿Finalizar el sorteo con el número de lotería ${numeroCompleto}?\nNúmero ganador (2 últimos dígitos): ${dosUltimosDigitos}\nEsta acción no se puede deshacer.`)) {
      return;
    }

    setProcesando('sorteo');
    try {
      const response = await boletaService.finalizarSorteo(secretKey, dosUltimosDigitos, numeroCompleto);
      if (response.success) {
        setSorteoFinalizado(true);
        setNumeroGanador(dosUltimosDigitos);
        setNumeroLoteriaCompleto(numeroCompleto);
        setMostrarModalSorteo(false);
        setNumeroLoteriaInput('');
        alert('¡Sorteo finalizado exitosamente!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al finalizar sorteo');
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

        {/* Estado del Sorteo y Acciones */}
        <div className="mb-6">
          {sorteoFinalizado && numeroGanador ? (
            <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-xl p-6 border-4 border-yellow-300 shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-gray-900" />
                <h3 className="text-2xl font-black text-gray-900">Sorteo Finalizado</h3>
              </div>
              {numeroLoteriaCompleto && (
                <div className="bg-gray-900/20 rounded-lg p-3 mb-3">
                  <p className="text-gray-900 text-center text-sm font-semibold mb-1">
                    Número de Lotería de Boyacá:
                  </p>
                  <p className="text-3xl font-black text-gray-900 text-center">{numeroLoteriaCompleto}</p>
                </div>
              )}
              <p className="text-gray-900 text-center text-lg mb-2">Número Ganador (2 últimos dígitos):</p>
              <p className="text-6xl font-black text-gray-900 text-center">{numeroGanador}</p>
              <p className="text-gray-800 text-sm mt-4 text-center">
                Los usuarios verán los resultados automáticamente en la página principal
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Finalizar Sorteo</h3>
                  <p className="text-blue-200 text-sm">
                    Ingresa el número ganador para finalizar el sorteo
                  </p>
                </div>
                <button
                  onClick={() => setMostrarModalSorteo(true)}
                  disabled={procesando !== null}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Finalizar
                </button>
              </div>
            </div>
          )}
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

        {/* Modal Finalizar Sorteo */}
        {mostrarModalSorteo && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setMostrarModalSorteo(false)}
          >
            <div 
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Finalizar Sorteo</h2>
              </div>

              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Número de Lotería de Boyacá (4 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  pattern="\d{4}"
                  value={numeroLoteriaInput}
                  onChange={(e) => setNumeroLoteriaInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none text-2xl font-bold text-center"
                  placeholder="0000"
                />
                {numeroLoteriaInput.length === 4 && (
                  <p className="text-green-400 text-sm mt-2 text-center">
                    Número ganador (2 últimos dígitos): <span className="font-bold text-lg">{numeroLoteriaInput.slice(-2)}</span>
                  </p>
                )}
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 text-sm">
                  ⚠️ Esta acción no se puede deshacer. Ingresa el número completo de 4 dígitos de la Lotería de Boyacá. Se tomará como ganador los 2 últimos dígitos.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalSorteo(false)}
                  disabled={procesando !== null}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinalizarSorteo}
                  disabled={procesando !== null}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {procesando === 'sorteo' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      Finalizar
                    </>
                  )}
                </button>
              </div>
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
