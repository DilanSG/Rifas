import { useState } from 'react';
import { X, CreditCard, User, Phone, Loader2, Upload, ImageIcon } from 'lucide-react';

interface ModalPagoProps {
  boletaNumero: number;
  onClose: () => void;
  onConfirmar: (nombre: string, telefono: string, comprobante?: File) => Promise<any>;
}

export const ModalPago = ({ boletaNumero, onClose, onConfirmar }: ModalPagoProps) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      setComprobante(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim() || !telefono.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await onConfirmar(nombre, telefono, comprobante || undefined);
      alert('¡Boleta reservada exitosamente! Recibirás confirmación cuando se verifique el pago.');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la reserva. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-700/50 animate-scale-in max-h-[95vh] overflow-y-auto">
        {/* Header con gradiente igual al home */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 sm:px-6 py-4 sm:py-5 text-white sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <h2 className="text-lg sm:text-xl font-bold">
                  Comprar Boleta #{boletaNumero}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
              disabled={loading}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
          {/* Info de precio */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-bold text-lg sm:text-2xl">Precio total</span>
              <span className="text-lg sm:text-2xl font-bold text-white">$20.000</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Campo Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-gray-300 font-medium text-xs sm:text-sm mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  Nombre completo <span className="text-red-400">*</span>
                </div>
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                placeholder="Tu nombre completo"
                required
                disabled={loading}
              />
            </div>

            {/* Campo Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-gray-300 font-medium text-xs sm:text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  Número de teléfono <span className="text-red-400">*</span>
                </div>
              </label>
              <input
                type="tel"
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                placeholder="3001234567"
                required
                disabled={loading}
              />
            </div>

            {/* Campo Comprobante (opcional) */}
            <div>
              <label htmlFor="comprobante" className="block text-gray-300 font-medium text-xs sm:text-sm mb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  Comprobante <span className="text-gray-500 text-xs">(opcional)</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="comprobante"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
                <label
                  htmlFor="comprobante"
                  className={`
                    w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border-2 border-dashed border-white/30 rounded-lg
                    flex items-center justify-center gap-2 cursor-pointer
                    hover:bg-white/20 hover:border-teal-500 transition-all
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {comprobante ? (
                    <>
                      <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                      <span className="text-xs sm:text-sm text-gray-300 truncate max-w-[150px] sm:max-w-[200px]">
                        {comprobante.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-400">
                        Adjuntar captura
                      </span>
                    </>
                  )}
                </label>
              </div>
              {comprobante && (
                <button
                  type="button"
                  onClick={() => setComprobante(null)}
                  className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors"
                  disabled={loading}
                >
                  Eliminar archivo
                </button>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm sm:text-base font-medium transition-colors border border-white/20"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg text-sm sm:text-base font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="hidden sm:inline">Reservando...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                    Comprar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
