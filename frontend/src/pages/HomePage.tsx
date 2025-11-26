import { useState, useEffect } from 'react';
import { Loader2, Info, X } from 'lucide-react';
import { Boleta } from '../types';
import { boletaService } from '../services/api';
import { BoletaItem } from '../components/BoletaItem';
import { ModalPago } from '../components/ModalPago';

export const HomePage = () => {
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState<number | null>(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSeleccionarBoleta = (numero: number) => {
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
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-transparent hover:bg-white/10 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label="Información de compra"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Modal de instrucciones */}
          {mostrarInfo && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 rounded-2xl sm:rounded-3xl flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl max-w-sm w-full p-4 sm:p-6 relative border border-gray-700">
                <button
                  onClick={() => setMostrarInfo(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-blue-500" />
                  ¿Cómo comprar?
                </h3>
                
                <div className="space-y-3 text-gray-200 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      1
                    </div>
                    <p><strong>Elige tu número:</strong> Selecciona una boleta disponible (en blanco) del tablero.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      2
                    </div>
                    <p><strong>Completa tus datos:</strong> Ingresa tu nombre y teléfono en el formulario.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      3
                    </div>
                    <p><strong>Realiza el pago:</strong> Transfiere al número <span className="font-bold text-white">3105572015</span> (Dilan Acuña).</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      4
                    </div>
                    <p><strong>Adjunta comprobante:</strong> Si subes el comprobante, tu boleta se marca como <span className="text-green-400 font-semibold">comprada</span>. Si no lo adjuntas, quedará <span className="text-yellow-400 font-semibold">reservada</span> temporalmente.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      ✓
                    </div>
                    <p><strong>¡Listo!</strong> Tu boleta será confirmada y aparecerá marcada. ¡Mucha suerte!</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400 text-center">
                    El sorteo es el <strong className="text-white">20 de Diciembre 2025</strong> con la Lotería de Boyacá
                  </p>
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
                <p className="text-gray-400 mb-0.5 text-[10px] sm:text-xs">Transferencias al:</p>
                <p className="text-white font-bold text-xs sm:text-sm">3105572015</p>
                <p className="text-gray-300 text-[9px] sm:text-[10px]">Responsable Dilan Acuña</p>
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
    </div>
  );
};
