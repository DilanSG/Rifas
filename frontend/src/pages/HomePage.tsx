import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Info, X, Calendar, Lock } from 'lucide-react';
import { Boleta } from '../types';
import { boletaService } from '../services/api';
import { BoletaItem } from '../components/BoletaItem';
import { ModalPago } from '../components/ModalPago';
import { ResultadosPage } from './ResultadosPage';

export const HomePage = () => {
  const navigate = useNavigate();
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState<string | null>(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorteoFinalizado, setSorteoFinalizado] = useState(false);
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState(false);
  const [secretKeyInput, setSecretKeyInput] = useState('');

  useEffect(() => {
    cargarDatos();
    verificarSorteo();
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      cargarDatos();
      verificarSorteo();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const verificarSorteo = async () => {
    try {
      const response = await boletaService.verificarSorteo();
      if (response.success) {
        setSorteoFinalizado(response.data.finalizado);
      }
    } catch (err) {
      console.error('Error al verificar sorteo:', err);
    }
  };

  const cargarDatos = async () => {
    try {
      const boletasData = await boletaService.obtenerBoletas();
      setBoletas(boletasData);
      setError(null);
    } catch (err) {
      setError('Error al cargar las boletas. Por favor, intenta nuevamente.');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarBoleta = (numero: string) => {
    setBoletaSeleccionada(numero);
  };

  const handleCerrarModal = () => {
    setBoletaSeleccionada(null);
  };

  const handleConfirmarPago = async (nombre: string, telefono: string, comprobante?: File) => {
    if (!boletaSeleccionada) return;

    try {
      // Reservar la boleta con los datos del usuario y comprobante opcional
      await boletaService.reservarBoleta(
        boletaSeleccionada, 
        { nombre, telefono },
        comprobante
      );

      // Recargar las boletas para actualizar el estado
      await cargarDatos();
      
      return { success: true };
    } catch (err: any) {
      console.error('Error:', err);
      throw err;
    }
  };

  const handleAccesoAdmin = () => {
    if (secretKeyInput.trim()) {
      navigate(`/admin/${secretKeyInput}`);
      setMostrarModalAdmin(false);
      setSecretKeyInput('');
    }
  };

  // Si el sorteo está finalizado, mostrar página de resultados
  if (sorteoFinalizado) {
    return <ResultadosPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Cargando boletas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-md w-full relative z-10">
        {/* Card principal con fondo oscuro */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50">
          {/* Botón de información en la esquina superior izquierda */}
          <button
            onClick={() => setMostrarInfo(!mostrarInfo)}
            className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 bg-transparent hover:bg-white/10 text-white rounded-full px-3 py-2 transition-all duration-200 hover:scale-105 flex items-center gap-1.5"
            aria-label="Información de compra"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Info</span>
          </button>

          {/* Modal de instrucciones */}
          {mostrarInfo && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl max-w-lg w-full relative border border-gray-700 my-4 max-h-[95vh] overflow-hidden flex flex-col">
                <div className="flex-shrink-0 p-4 sm:p-6 pb-3">
                  <button
                    onClick={() => setMostrarInfo(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800 rounded-full p-1"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 pr-12">
                    <Info className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500 flex-shrink-0" />
                    <span>¿Cómo comprar?</span>
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
                  <div className="space-y-3 sm:space-y-4 text-gray-200 text-sm sm:text-base">
                    <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      1
                    </div>
                    <p className="leading-relaxed"><strong>Elige tu número:</strong> Selecciona una boleta disponible (en blanco) del tablero.</p>
                  </div>
                  
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      2
                    </div>
                    <p className="leading-relaxed"><strong>Completa tus datos:</strong> Ingresa tu nombre y teléfono en el formulario.</p>
                  </div>
                  
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      3
                    </div>
                    <p className="leading-relaxed"><strong>Realiza el pago:</strong> Transfiere al número <span className="font-bold text-white">3105572015</span> (Dilan Acuña).</p>
                  </div>
                  
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      4
                    </div>
                    <p className="leading-relaxed"><strong>Adjunta comprobante:</strong> Si subes el comprobante, tu boleta se marca como <span className="text-green-400 font-semibold">comprada</span>. Si no lo adjuntas, quedará <span className="text-yellow-400 font-semibold">reservada</span> temporalmente y el responsable se contactara contigo para confirmar la compra una semana antes del sorteo.</p>
                  </div>
                  
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      5
                    </div>
                    <p className="leading-relaxed"><strong>¡Listo!</strong> Cuando tu boleta sea confirmada aparecerá marcada en verde como valida para el sorteo. ¡Mucha suerte!</p>
                  </div>
                  
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      6
                    </div>
                    <div>
                      <p className="mb-2 sm:mb-3 leading-relaxed">
                        <strong>Resultados del sorteo:</strong> El 20 de diciembre, esta página se actualizará automáticamente 
                        mostrando el número ganador y los datos de todas las boletas vendidas para total transparencia.
                      </p>
                      <button 
                        onClick={() => navigate('/ejemplo-resultados')}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                      >
                        Ver ejemplo de resultados →
                      </button>
                    </div>
                  </div>
                  
                  
                  <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-700">
                    <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-green-300 mb-1 text-xs sm:text-sm">Seguridad Garantizada</p>
                          <p className="text-xs sm:text-sm text-green-200 leading-relaxed">
                            Todos tus datos están protegidos en nuestra base de datos. No habrá cambios ni errores en la información de compra. 
                            Al finalizar el sorteo, la página mostrará ciertos datos de hora, fecha y comprador de cada número para total transparencia.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <p className="text-xs sm:text-sm">
                        Sorteo: <strong className="text-white">20 de Diciembre 2025</strong> con la Lotería de Boyacá
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Header con título y premio */}
          <div className="text-center pt-4 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 relative">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-3">
              <span className="text-gray-300">GRAN</span>
              <span className="text-white italic">rifa</span>
            </h1>
            <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-1">
              $1.000.000
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-3 sm:mx-6 mb-3 sm:mb-4">
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-3 py-2 rounded-lg text-xs">
                {error}
              </div>
            </div>
          )}

          {/* Grid de Boletas */}
          <div className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-4 shadow-inner">
              <div className="grid grid-cols-10 gap-0.5 sm:gap-1">
                {boletas.map((boleta) => (
                  <BoletaItem
                    key={boleta._id}
                    boleta={boleta}
                    onSelect={handleSeleccionarBoleta}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer con información */}
          <div className="bg-black/40 backdrop-blur-sm px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-700/50">
            <div className="flex justify-between items-center text-xs sm:text-xs mb-2 sm:mb-3">
              <div className="text-left">
                <p className="text-white font-bold text-xs sm:text-sm">Valor: $20.000</p>
                <p className="text-gray-400 mb-0.5 text-[10px] sm:text-xs">Transferencias al:</p>
                <p className="text-white font-bold text-xs sm:text-sm">3105572015</p>
                <p 
                  className="text-gray-300 text-[9px] sm:text-[10px] cursor-pointer transition-colors"
                  onClick={() => setMostrarModalAdmin(true)}
                  >
                  Responsable Dilan Acuña
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 mb-0.5 text-[10px] sm:text-xs">Juega el:</p>
                <p className="text-white font-black text-2xl sm:text-2xl leading-none">20 Diciembre 2025</p>
                <p className="text-gray-300 text-xs sm:text-sm">Con la loteria de Boyacá (Sorteo 4603)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {boletaSeleccionada && (
        <ModalPago
          boletaNumero={boletaSeleccionada}
          onClose={handleCerrarModal}
          onConfirmar={handleConfirmarPago}
        />
      )}

      {/* Modal de Acceso Admin */}
      {mostrarModalAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 rounded-2xl sm:rounded-3xl flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl max-w-sm w-full p-4 sm:p-6 relative border border-gray-700">
            <button
              onClick={() => {
                setMostrarModalAdmin(false);
                setSecretKeyInput('');
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-500" />
              Acceso Administrativo
            </h3>

            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2 text-sm">
                Clave Secreta
              </label>
              <input
                type="password"
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAccesoAdmin()}
                className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-white font-mono placeholder-gray-400"
                placeholder="Ingresa la clave de acceso"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalAdmin(false);
                  setSecretKeyInput('');
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAccesoAdmin}
                disabled={!secretKeyInput.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Acceder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
