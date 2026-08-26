import { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

export const ServerLoading = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          {/* Icono animado */}
          <div className="mb-6 relative">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wifi className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Preparando todo{dots}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6">
            El servidor se está iniciando. Esto puede tomar unos segundos.
          </p>

          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-yellow-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
