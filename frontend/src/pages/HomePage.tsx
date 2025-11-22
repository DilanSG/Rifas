import { useState, useEffect } from 'react';
import { Boleta, Estadisticas } from '../types';
import { boletaService, pagoService } from '../services/api';
import { BoletaItem } from '../components/BoletaItem';
import { ModalPago } from '../components/ModalPago';

export const HomePage = () => {
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState<number | null>(null);
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
      const [boletasData, stats] = await Promise.all([
        boletaService.obtenerBoletas(),
        boletaService.obtenerEstadisticas()
      ]);
      setBoletas(boletasData);
      setEstadisticas(stats);
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

  const handleConfirmarPago = async (nombre: string, telefono: string) => {
    if (!boletaSeleccionada) return;

    try {
      // Primero reservar la boleta
      await boletaService.reservarBoleta(boletaSeleccionada, { nombre, telefono });

      // Crear intención de pago
      const response = await pagoService.crearPago({
        boletaNumero: boletaSeleccionada,
        nombre,
        telefono
      });

      // Redirigir a Wompi para pago
      alert(`✅ Boleta #${boletaSeleccionada} reservada por 10 minutos!\n\nSerás redirigido a Wompi para completar el pago.\n\nTransactionId: ${response.data.transactionId}`);
      
      handleCerrarModal();
      
      // Recargar datos después de unos segundos
      setTimeout(() => {
        cargarDatos();
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar la reserva');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando boletas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🎟️ Rifa de Boletas
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona tu número de la suerte
          </p>
        </div>

        {/* Precio */}
        <div className="max-w-md mx-auto mb-8 bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600 mb-2">Precio por boleta</p>
          <p className="text-4xl font-bold text-blue-600">$10.000</p>
          <p className="text-sm text-gray-500 mt-2">COP</p>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-disponible">{estadisticas.disponibles}</p>
              <p className="text-sm text-gray-600">Disponibles</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-reservada">{estadisticas.reservadas}</p>
              <p className="text-sm text-gray-600">Reservadas</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-pagada">{estadisticas.pagadas}</p>
              <p className="text-sm text-gray-600">Vendidas</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-disponible rounded"></div>
            <span className="text-sm text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pagada rounded"></div>
            <span className="text-sm text-gray-700">Vendida</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-4xl mx-auto mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Grid de Boletas */}
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
            {boletas.map((boleta) => (
              <BoletaItem
                key={boleta._id}
                boleta={boleta}
                onSelect={handleSeleccionarBoleta}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Las boletas se actualizan automáticamente cada 30 segundos</p>
          <p className="mt-2">Sistema seguro de pagos con Wompi</p>
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
