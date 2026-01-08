import { memo } from 'react';
import type { Pokemon, PokemonType } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  isSelected?: boolean;
  warningTypes?: PokemonType[];
  disabled?: boolean;
}

export const PokemonCard = memo(function PokemonCard({
  pokemon,
  onClick,
  isSelected = false,
  warningTypes = [],
  disabled = false,
}: PokemonCardProps) {
  const hasWarning = warningTypes.length > 0;

  const statusLabel = isSelected
    ? 'Selected'
    : hasWarning
      ? `Warning: adds weakness to ${warningTypes.join(', ')}`
      : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="listitem"
      aria-pressed={isSelected}
      aria-label={`${pokemon.displayName}, ${pokemon.types.join(' and ')} type${statusLabel ? `. ${statusLabel}` : ''}`}
      className={`
        relative flex flex-col items-center p-1.5 sm:p-2 rounded-lg border-2 transition-all
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
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
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full" aria-hidden="true">
          !
        </div>
      )}

      {pokemon.megas?.length && (
        <div className="absolute -top-2 -left-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full" aria-label="Has Mega Evolution">
          M
        </div>
      )}

      <img
        src={pokemon.sprite}
        alt=""
        aria-hidden="true"
        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
        loading="lazy"
      />

      <span className="text-xs sm:text-sm font-medium mt-1 text-center leading-tight">
        {pokemon.displayName}
      </span>

      <div className="flex gap-0.5 sm:gap-1 mt-1 flex-wrap justify-center" aria-hidden="true">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} size="xs" />
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
});
