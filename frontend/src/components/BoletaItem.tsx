import { Boleta as BoletaType, BoletaEstado } from '../types';

interface BoletaItemProps {
  boleta: BoletaType;
  onSelect: (numero: number) => void;
}

export const BoletaItem = ({ boleta, onSelect }: BoletaItemProps) => {
  const getEstadoClasses = () => {
    switch (boleta.estado) {
      case BoletaEstado.DISPONIBLE:
        return 'bg-disponible hover:bg-green-600 cursor-pointer text-white';
      case BoletaEstado.RESERVADA:
        return 'bg-reservada cursor-not-allowed text-white opacity-60';
      case BoletaEstado.PAGADA:
        return 'bg-pagada cursor-not-allowed text-white';
      default:
        return 'bg-gray-300';
    }
  };

  const getEstadoTexto = () => {
    switch (boleta.estado) {
      case BoletaEstado.DISPONIBLE:
        return 'Disponible';
      case BoletaEstado.RESERVADA:
        return 'Reservada';
      case BoletaEstado.PAGADA:
        return 'Vendida';
      default:
        return '';
    }
  };

  const handleClick = () => {
    if (boleta.estado === BoletaEstado.DISPONIBLE) {
      onSelect(boleta.numero);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center
        p-4 rounded-lg transition-all duration-200
        ${getEstadoClasses()}
        ${boleta.estado === BoletaEstado.DISPONIBLE ? 'transform hover:scale-105 shadow-lg' : ''}
      `}
    >
      <div className="text-2xl font-bold">
        {String(boleta.numero).padStart(2, '0')}
      </div>
      <div className="text-xs mt-1 opacity-90">
        {getEstadoTexto()}
      </div>
    </div>
  );
};
