import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, CheckCircle, Clock, Home } from 'lucide-react';

export const EjemploResultadosPage = () => {
  const navigate = useNavigate();
  
  // Datos artificiales de ejemplo
  const datosEjemplo = {
    numeroLoteriaCompleto: "3842",
    numeroGanador: "42",
    fechaFinalizacion: "2025-12-20T22:00:00",
    ganador: {
      numero: "42",
      nombreCensurado: "Ma*** Ro***",
      telefonoCensurado: "******7890",
      fechaCompra: "2025-12-15T14:23:00",
      vendida: true
    },
    boletasPagadas: [
      { numero: "01", nombreCensurado: "Ra*** Pe***", telefonoCensurado: "******2907", fechaCompra: "2025-12-10T10:15:00" },
      { numero: "07", nombreCensurado: "Ju*** He***", telefonoCensurado: "******2015", fechaCompra: "2025-12-11T16:42:00" },
      { numero: "15", nombreCensurado: "An*** Go***", telefonoCensurado: "******4561", fechaCompra: "2025-12-12T09:30:00" },
      { numero: "23", nombreCensurado: "Lu*** Sá***", telefonoCensurado: "******7823", fechaCompra: "2025-12-13T11:20:00" },
      { numero: "42", nombreCensurado: "Ma*** Ro***", telefonoCensurado: "******7890", fechaCompra: "2025-12-15T14:23:00" },
      { numero: "58", nombreCensurado: "Jo*** Me***", telefonoCensurado: "******9012", fechaCompra: "2025-12-16T08:45:00" },
      { numero: "67", nombreCensurado: "So*** Vá***", telefonoCensurado: "******3456", fechaCompra: "2025-12-17T13:15:00" },
      { numero: "89", nombreCensurado: "Pa*** Ca***", telefonoCensurado: "******6789", fechaCompra: "2025-12-18T17:00:00" }
    ],
    boletasReservadas: [
      { numero: "12", nombreCensurado: "Fe*** Mo***", telefonoCensurado: "******1234", fechaCompra: "2025-12-14T12:00:00" },
      { numero: "34", nombreCensurado: "Cl*** Ri***", telefonoCensurado: "******5678", fechaCompra: "2025-12-15T15:30:00" }
    ]
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Botón de Volver al Inicio */}
        <div className="mb-4 sm:mb-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-white font-semibold transition-all transform hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Volver al Inicio
          </button>
        </div>

        {/* Banner de ejemplo */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-block bg-transparent text-white py-2 px-4 sm:px-6 rounded-lg font-semibold text-xs sm:text-sm">
           Pagina Ejemplo: Así se verán los resultados el 20 de diciembre
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            <span>Resultados del Sorteo</span>
          </h1>
          
          {/* Ganador */}
          <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl border-2 sm:border-4 border-yellow-300 max-w-2xl mx-auto">
            <div className="bg-gray-900/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-800">
              <p className="text-gray-900 font-semibold text-sm sm:text-base mb-2">
                Número de Lotería de Boyacá:
              </p>
              <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                {datosEjemplo.numeroLoteriaCompleto}
              </p>
              <p className="text-gray-800 text-xs sm:text-sm font-medium">
                Se gana con los 2 últimos dígitos
              </p>
            </div>
            <p className="text-gray-900 font-bold text-lg sm:text-2xl mb-3 sm:mb-4 flex items-center justify-center gap-2">
              Número Ganador
            </p>
            <p className="text-5xl sm:text-7xl font-black text-gray-900 mb-4 sm:mb-6">{datosEjemplo.numeroGanador}</p>
            
            <div className="bg-white/20 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-gray-900">
                <div>
                  <p className="text-xs sm:text-sm font-semibold mb-1">Ganador</p>
                  <p className="text-base sm:text-lg font-bold break-words">{datosEjemplo.ganador.nombreCensurado}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold mb-1">Teléfono</p>
                  <p className="text-base sm:text-lg font-bold">{datosEjemplo.ganador.telefonoCensurado}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold mb-1">Fecha de compra</p>
                  <p className="text-sm sm:text-base font-bold">{formatearFecha(datosEjemplo.ganador.fechaCompra)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold mb-1">Sorteo finalizado</p>
                  <p className="text-sm sm:text-base font-bold">{formatearFecha(datosEjemplo.fechaFinalizacion)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
            <Calendar className="w-5 h-5" />
            <p className="text-sm">
              Sorteo finalizado el <span className="text-white font-bold">20 de Diciembre 2025</span>
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
            <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Total de boletas</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">100</p>
          </div>
          <div className="bg-green-900/30 border border-green-700/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              <p className="text-green-300 text-xs sm:text-sm">Boletas pagadas</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-400">{datosEjemplo.boletasPagadas.length}</p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <p className="text-yellow-300 text-xs sm:text-sm">Boletas reservadas</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{datosEjemplo.boletasReservadas.length}</p>
          </div>
        </div>

        {/* Boletas Pagadas */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            Boletas Pagadas ({datosEjemplo.boletasPagadas.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {datosEjemplo.boletasPagadas.map((boleta) => (
              <div 
                key={boleta.numero}
                className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 ${
                  boleta.numero === datosEjemplo.numeroGanador
                    ? 'bg-yellow-500/20 border-yellow-400'
                    : 'bg-green-900/30 border-green-700/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <span className={`text-2xl sm:text-3xl font-black ${
                    boleta.numero === datosEjemplo.numeroGanador ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {boleta.numero}
                  </span>
                  {boleta.numero === datosEjemplo.numeroGanador && (
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  )}
                </div>
                <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                  <p className="text-gray-300 break-words">
                    👤 {boleta.nombreCensurado}
                  </p>
                  <p className="text-gray-300">
                    📱 {boleta.telefonoCensurado}
                  </p>
                  <p className="text-gray-400 text-[10px] sm:text-xs">
                    📅 {formatearFecha(boleta.fechaCompra)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boletas Reservadas */}
        {datosEjemplo.boletasReservadas.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              Boletas Reservadas ({datosEjemplo.boletasReservadas.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {datosEjemplo.boletasReservadas.map((boleta) => (
                <div 
                  key={boleta.numero}
                  className="bg-yellow-900/30 border-2 border-yellow-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4"
                >
                  <span className="text-2xl sm:text-3xl font-black text-yellow-400 block mb-2 sm:mb-3">
                    {boleta.numero}
                  </span>
                  <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                    <p className="text-gray-300 break-words">
                      👤 {boleta.nombreCensurado}
                    </p>
                    <p className="text-gray-300">
                      📱 {boleta.telefonoCensurado}
                    </p>
                    <p className="text-gray-400 text-[10px] sm:text-xs">
                      📅 {formatearFecha(boleta.fechaCompra)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
