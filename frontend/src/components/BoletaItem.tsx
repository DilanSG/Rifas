import { Boleta as BoletaType, BoletaEstado } from '../types';

interface BoletaItemProps {
  boleta: BoletaType;
  onSelect: (numero: number) => void;
}

export const BoletaItem = ({ boleta, onSelect }: BoletaItemProps) => {
  const getEstadoClasses = () => {
    switch (boleta.estado) {
      case BoletaEstado.DISPONIBLE:
        return 'bg-white hover:bg-gray-50 border-2 border-gray-300 cursor-pointer text-gray-800 shadow-sm hover:shadow-md hover:border-teal-500';
      case BoletaEstado.RESERVADA:
        return 'bg-gray-200 border-2 border-gray-300 cursor-not-allowed text-gray-500 opacity-60';
      case BoletaEstado.PAGADA:
        return 'bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 cursor-not-allowed text-white shadow-md relative';
      default:
        return 'bg-slate-300';
    }
  };

  const handleClick = () => {
    if (boleta.estado === BoletaEstado.DISPONIBLE) {
      onSelect(boleta.numero);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={boleta.estado !== BoletaEstado.DISPONIBLE}
      className={`
        relative flex items-center justify-center
        aspect-square rounded transition-all duration-200
        ${getEstadoClasses()}
        ${boleta.estado === BoletaEstado.DISPONIBLE 
          ? 'transform hover:scale-105 active:scale-95' 
          : ''
        }
        focus:outline-none focus:ring-2 focus:ring-teal-400
      `}
    >
      <span className="text-[9px] sm:text-[10px] font-bold tabular-nums">
        {boleta.numero}
      </span>
    </button>
  );
};
