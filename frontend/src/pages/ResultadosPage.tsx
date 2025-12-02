import { useState, useEffect } from 'react';
import { Loader2, Trophy, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { boletaService } from '../services/api';


interface ResultadoBoleta {
  numero: string;
  estado: string;
  nombreCensurado: string;
  telefonoCensurado: string;
  fechaCompra: string;
}

interface GanadorData {
  numero: string;
  estado: string;
  nombreCensurado: string;
  telefonoCensurado: string;
  fechaCompra: string | null;
  vendida: boolean;
}

interface ResultadosData {
  resultados: ResultadoBoleta[];
  sorteoFinalizado: boolean;
  numeroGanador?: string;
  fechaFinalizacion?: string;
  ganador?: GanadorData | null;
}

export const ResultadosPage = () => {
  const [datos, setDatos] = useState<ResultadosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarResultados();
    const interval = setInterval(cargarResultados, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarResultados = async () => {
    try {
      const response = await boletaService.obtenerResultados();
      if (response.success) {
        setDatos(response.data);
        setError(null);
      }
    } catch (err) {
      setError('Error al cargar los resultados');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const boletasReservadas = datos?.resultados.filter(b => b.estado === 'reservada') || [];
  const boletasPagadas = datos?.resultados.filter(b => b.estado === 'pagada') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Resultados del Sorteo
          </h1>
          
          {datos?.sorteoFinalizado && datos.numeroGanador && (
            <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-2xl p-8 shadow-2xl border-4 border-yellow-300 max-w-2xl mx-auto">
              <p className="text-gray-900 font-bold text-2xl mb-4 flex items-center justify-center gap-2">
                🎉 Número Ganador 🎉
              </p>
              <p className="text-7xl font-black text-gray-900 mb-6">{datos.numeroGanador}</p>
              
              {datos.ganador ? (
                datos.ganador.vendida ? (
                  <div className="bg-white/30 rounded-xl p-6 space-y-3">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <CheckCircle className="w-6 h-6 text-gray-900" />
                      <span className="text-gray-900 font-bold text-lg">
                        Estado: {datos.ganador.estado === 'pagada' ? 'COMPRADA' : 'RESERVADA'}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-800 text-sm font-semibold mb-1">Comprador:</p>
                      <p className="text-gray-900 font-black text-2xl">{datos.ganador.nombreCensurado}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-800 text-sm font-semibold mb-1">Teléfono:</p>
                      <p className="text-gray-900 font-bold text-xl">{datos.ganador.telefonoCensurado}</p>
                    </div>
                    {datos.ganador.fechaCompra && (
                      <div className="text-center">
                        <p className="text-gray-800 text-sm font-semibold mb-1">Fecha de Compra:</p>
                        <p className="text-gray-900 font-medium flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(datos.ganador.fechaCompra).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-500/30 rounded-xl p-6">
                    <p className="text-gray-900 font-bold text-lg flex items-center justify-center gap-2">
                      <XCircle className="w-6 h-6" />
                      Boleta No Vendida
                    </p>
                    <p className="text-gray-800 text-sm mt-2">Esta boleta no fue comprada por ningún participante</p>
                  </div>
                )
              ) : null}
              
              {datos.fechaFinalizacion && (
                <p className="text-gray-700 text-sm mt-6 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Sorteo finalizado: {new Date(datos.fechaFinalizacion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          )}

          {!datos?.sorteoFinalizado && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 max-w-md mx-auto border border-gray-700">
              <p className="text-blue-400 font-semibold text-lg flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Sorteo Pendiente
              </p>
              <p className="text-gray-400 text-sm mt-2">
                El sorteo aún no ha finalizado. Los resultados aparecerán aquí una vez concluya.
              </p>
            </div>
          )}
        </div>

        {/* Sección Boletas Pagadas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            Boletas Compradas ({boletasPagadas.length})
          </h2>
          
          {boletasPagadas.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700">
              <p className="text-gray-400">No hay boletas compradas aún</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boletasPagadas.map((boleta) => (
                <div
                  key={boleta.numero}
                  className={`rounded-xl p-5 border-2 transition-all ${
                    datos?.numeroGanador === boleta.numero
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-300 shadow-2xl scale-105'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-3xl font-black ${
                      datos?.numeroGanador === boleta.numero ? 'text-gray-900' : 'text-green-400'
                    }`}>
                      {boleta.numero}
                    </span>
                    {datos?.numeroGanador === boleta.numero && (
                      <Trophy className="w-8 h-8 text-gray-900 animate-bounce" />
                    )}
                  </div>
                  <p className={`text-sm font-medium mb-1 ${
                    datos?.numeroGanador === boleta.numero ? 'text-gray-900' : 'text-gray-300'
                  }`}>
                    {boleta.nombreCensurado}
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${
                    datos?.numeroGanador === boleta.numero ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(boleta.fechaCompra).toLocaleDateString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección Boletas Reservadas */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-yellow-400" />
            Boletas Reservadas ({boletasReservadas.length})
          </h2>
          
          {boletasReservadas.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700">
              <p className="text-gray-400">No hay boletas reservadas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boletasReservadas.map((boleta) => (
                <div
                  key={boleta.numero}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-2 border-gray-700 hover:border-yellow-500 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-3xl font-black text-yellow-400">
                      {boleta.numero}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-300 mb-1">
                    {boleta.nombreCensurado}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(boleta.fechaCompra).toLocaleDateString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 max-w-2xl mx-auto">
            <h3 className="text-white font-bold text-lg mb-3">
              Transparencia en el Sorteo
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Esta página muestra todas las boletas compradas y reservadas del sorteo. 
              Los Datos de los compradores están censurados para proteger su privacidad, 
              pero pueden verificar su boleta con sus datos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
