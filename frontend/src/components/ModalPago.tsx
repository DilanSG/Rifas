import { useState } from 'react';

interface ModalPagoProps {
  boletaNumero: number;
  onClose: () => void;
  onConfirmar: (nombre: string, telefono: string) => void;
}

export const ModalPago = ({ boletaNumero, onClose, onConfirmar }: ModalPagoProps) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim() || !telefono.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await onConfirmar(nombre, telefono);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Comprar Boleta #{String(boletaNumero).padStart(2, '0')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Precio:</span> $10.000 COP
            </p>
            <p className="text-sm text-gray-600">
              La boleta se reservará por 10 minutos mientras completas el pago.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-gray-700 font-medium mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre completo"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="telefono" className="block text-gray-700 font-medium mb-2">
              Número de teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="3001234567"
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Continuar al pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
