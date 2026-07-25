import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, CheckCircle, Clock, Home, XCircle } from 'lucide-react';

export const EjemploResultadosPage = () => {
  const navigate = useNavigate();
  
  const datosEjemplo = {
    numeroLoteriaCompleto: "3842",
    numeroGanador: "42",
    fechaFinalizacion: "2026-08-29T22:00:00",
    ganador: {
      numero: "42",
      estado: "pagada",
      nombreCensurado: "Ma*** Ro***",
      telefonoCensurado: "******7890",
      fechaCompra: "2026-08-20T14:23:00",
      vendida: true
    },
    boletasPagadas: [
      { numero: "01", nombreCensurado: "Ra*** Pe***", fechaCompra: "2026-08-10T10:15:00" },
      { numero: "07", nombreCensurado: "Ju*** He***", fechaCompra: "2026-08-11T16:42:00" },
      { numero: "15", nombreCensurado: "An*** Go***", fechaCompra: "2026-08-12T09:30:00" },
      { numero: "23", nombreCensurado: "Lu*** Sá***", fechaCompra: "2026-08-13T11:20:00" },
      { numero: "42", nombreCensurado: "Ma*** Ro***", fechaCompra: "2026-08-20T14:23:00" },
      { numero: "58", nombreCensurado: "Jo*** Me***", fechaCompra: "2026-08-16T08:45:00" },
      { numero: "67", nombreCensurado: "So*** Vá***", fechaCompra: "2026-08-17T13:15:00" },
      { numero: "89", nombreCensurado: "Pa*** Ca***", fechaCompra: "2026-08-18T17:00:00" }
    ],
    boletasReservadas: [
      { numero: "12", nombreCensurado: "Fe*** Mo***", fechaCompra: "2026-08-14T12:00:00" },
      { numero: "34", nombreCensurado: "Cl*** Ri***", fechaCompra: "2026-08-15T15:30:00" }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-4 sm:py-8 px-3 sm:px-4 relative z-10">
      <div className="max-w-6xl mx-auto">

        <div className="mb-4 sm:mb-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </button>
        </div>

        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-block bg-blue-500/10 border border-blue-500/30 text-blue-300 py-2 px-4 sm:px-6 rounded-lg font-semibold text-xs sm:text-sm">
            Vista de ejemplo — Así se verán los resultados el 29 de agosto
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            <span>Resultados del Sorteo</span>
          </h1>

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

            {datosEjemplo.ganador.vendida ? (
              <div className="bg-white/30 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                  <span className="text-gray-900 font-bold text-base sm:text-lg">
                    Estado: COMPRADA
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-gray-800 text-xs sm:text-sm font-semibold mb-1">Comprador:</p>
                  <p className="text-gray-900 font-black text-xl sm:text-2xl break-words">{datosEjemplo.ganador.nombreCensurado}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-800 text-xs sm:text-sm font-semibold mb-1">Teléfono:</p>
                  <p className="text-gray-900 font-bold text-lg sm:text-xl">{datosEjemplo.ganador.telefonoCensurado}</p>
                </div>
                {datosEjemplo.ganador.fechaCompra && (
                  <div className="text-center">
                    <p className="text-gray-800 text-xs sm:text-sm font-semibold mb-1">Fecha de Compra:</p>
                    <p className="text-gray-900 font-medium text-sm sm:text-base flex items-center justify-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {new Date(datosEjemplo.ganador.fechaCompra).toLocaleDateString('es-CO', {
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
              <div className="bg-red-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <p className="text-gray-900 font-bold text-base sm:text-lg flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  Boleta No Vendida
                </p>
                <p className="text-gray-800 text-xs sm:text-sm mt-2">Esta boleta no fue comprada por ningún participante</p>
              </div>
            )}

            {datosEjemplo.fechaFinalizacion && (
              <p className="text-gray-700 text-sm mt-6 flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Sorteo finalizado: {new Date(datosEjemplo.fechaFinalizacion).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>

        {/* Boletas Pagadas */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            Boletas Compradas ({datosEjemplo.boletasPagadas.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {datosEjemplo.boletasPagadas.map((boleta) => (
              <div
                key={boleta.numero}
                className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border-2 transition-all ${
                  datosEjemplo.numeroGanador === boleta.numero
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-300 shadow-2xl scale-105'
                    : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <span className={`text-2xl sm:text-3xl font-black ${
                    datosEjemplo.numeroGanador === boleta.numero ? 'text-gray-900' : 'text-green-400'
                  }`}>
                    {boleta.numero}
                  </span>
                  {datosEjemplo.numeroGanador === boleta.numero && (
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900 animate-bounce" />
                  )}
                </div>
                <p className={`text-xs sm:text-sm font-medium mb-1 break-words ${
                  datosEjemplo.numeroGanador === boleta.numero ? 'text-gray-900' : 'text-gray-300'
                }`}>
                  {boleta.nombreCensurado}
                </p>
                <p className={`text-xs flex items-center gap-1 ${
                  datosEjemplo.numeroGanador === boleta.numero ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(boleta.fechaCompra).toLocaleDateString('es-CO')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Boletas Reservadas */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            Boletas Reservadas ({datosEjemplo.boletasReservadas.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {datosEjemplo.boletasReservadas.map((boleta) => (
              <div
                key={boleta.numero}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-2 border-gray-700"
              >
                <span className="text-3xl font-black text-yellow-400 block mb-3">
                  {boleta.numero}
                </span>
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
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700 max-w-2xl mx-auto">
            <h3 className="text-white font-bold text-base sm:text-lg mb-2 sm:mb-3">
              Transparencia en el Sorteo
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Esta página muestra todas las boletas compradas y reservadas del sorteo. 
              Los datos de los compradores están censurados para proteger su privacidad, 
              pero pueden verificar su boleta con sus datos.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
