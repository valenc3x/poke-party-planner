import type { Pokemon, PokemonType } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  isSelected?: boolean;
  warningTypes?: PokemonType[];
  disabled?: boolean;
}

export function PokemonCard({
  pokemon,
  onClick,
  isSelected = false,
  warningTypes = [],
  disabled = false,
}: PokemonCardProps) {
  const hasWarning = warningTypes.length > 0;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center p-2 rounded-lg border-2 transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
          : hasWarning
            ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-blue-400 hover:shadow-md cursor-pointer'
        }
      `}
    >
      {hasWarning && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          !
        </div>
      )}

      {pokemon.mega && (
        <div className="absolute -top-2 -left-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          M
        </div>
      )}

      <img
        src={pokemon.sprite}
        alt={pokemon.displayName}
        className="w-16 h-16 object-contain"
        loading="lazy"
      />

      <span className="text-sm font-medium mt-1 text-center leading-tight">
        {pokemon.displayName}
      </span>

      <div className="flex gap-1 mt-1 flex-wrap justify-center">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>

      {hasWarning && (
        <div className="absolute inset-0 flex items-end justify-center pb-1 pointer-events-none">
          <div className="flex gap-0.5">
            {warningTypes.slice(0, 3).map((type) => (
              <span
                key={type}
                className="w-2 h-2 rounded-full bg-orange-500"
                title={`Weak to ${type}`}
              />
            ))}
          </div>
        </div>
      )}
    </button>
  );
}
