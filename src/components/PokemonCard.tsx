import { memo } from 'react';
import type { Pokemon, PokemonType } from '../types/pokemon';
import { TypeBadge, TYPE_BG_COLORS } from './TypeBadge';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  isSelected?: boolean;
  warningTypes?: PokemonType[];
  recommendedTypes?: PokemonType[];
  disabled?: boolean;
}

export const PokemonCard = memo(function PokemonCard({
  pokemon,
  onClick,
  isSelected = false,
  warningTypes = [],
  recommendedTypes = [],
  disabled = false,
}: PokemonCardProps) {
  const hasWarning = warningTypes.length > 0;
  const hasRecommendation = recommendedTypes.length > 0;
  const isRisky = hasWarning && hasRecommendation;

  const statusLabel = isSelected
    ? 'Selected'
    : isRisky
      ? `Risky: covers ${recommendedTypes.join(', ')} but adds weakness to ${warningTypes.join(', ')}`
      : hasWarning
        ? `Warning: adds weakness to ${warningTypes.join(', ')}`
        : hasRecommendation
          ? `Recommended: covers ${recommendedTypes.join(', ')}`
          : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="listitem"
      aria-pressed={isSelected}
      aria-label={`${pokemon.displayName}, ${pokemon.types.join(' and ')} type${statusLabel ? `. ${statusLabel}` : ''}`}
      className={`
        relative flex flex-col items-center p-1.5 sm:p-2 rounded-lg border transition-all
        focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-1
        ${isSelected
          ? 'border-blue-300 bg-blue-50/80 shadow-[0_0_0_2px_rgba(147,197,253,0.5)] dark:bg-blue-900/20 dark:border-blue-400/50'
          : isRisky
            ? 'border-violet-200 bg-violet-50/50 shadow-[0_0_8px_rgba(180,160,210,0.4)] dark:bg-violet-900/10 dark:border-violet-400/30'
            : hasWarning
              ? 'border-rose-200 bg-rose-50/50 shadow-[0_0_8px_rgba(220,140,140,0.4)] dark:bg-rose-900/10 dark:border-rose-400/30'
              : hasRecommendation
                ? 'border-emerald-200 bg-emerald-50/50 shadow-[0_0_8px_rgba(134,197,161,0.4)] dark:bg-emerald-900/10 dark:border-emerald-400/30'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md cursor-pointer'
        }
      `}
    >
      {isRisky ? (
        <div className="absolute -top-2 -right-2 bg-violet-300/90 text-violet-800 text-xs px-1.5 py-0.5 rounded-full font-bold" aria-hidden="true">
          ⚡
        </div>
      ) : hasWarning ? (
        <div className="absolute -top-2 -right-2 bg-rose-300/90 text-rose-800 text-xs px-1.5 py-0.5 rounded-full font-medium" aria-hidden="true">
          !
        </div>
      ) : hasRecommendation ? (
        <div className="absolute -top-2 -right-2 bg-emerald-300/90 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full font-medium" aria-hidden="true">
          ✓
        </div>
      ) : null}

      <img
        src={pokemon.sprite}
        alt=""
        aria-hidden="true"
        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
        loading="lazy"
      />

      <div className="flex items-center gap-0.5 mt-1">
        <span className="text-xs sm:text-sm font-medium text-center leading-tight">
          {pokemon.displayName}
        </span>
        {pokemon.megas?.length && (
          <img
            src="/mega-icon.png"
            alt="Has Mega Evolution"
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70"
          />
        )}
      </div>

      <div className="flex gap-0.5 sm:gap-1 mt-1 flex-wrap justify-center" aria-hidden="true">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} size="xs" />
        ))}
      </div>

      {(hasWarning || hasRecommendation) && (
        <div className="flex gap-1 mt-1.5 justify-center">
          {isRisky ? (
            // Risky: show type-colored dots
            recommendedTypes.slice(0, 4).map((type) => (
              <span
                key={type}
                className={`w-3.5 h-3.5 rounded-full cursor-help ${TYPE_BG_COLORS[type]}`}
                title={`Covers ${type} (risky - also adds weakness)`}
              />
            ))
          ) : hasWarning ? (
            // Warning only: show type-colored dots
            warningTypes.slice(0, 4).map((type) => (
              <span
                key={type}
                className={`w-3.5 h-3.5 rounded-full cursor-help ${TYPE_BG_COLORS[type]}`}
                title={`Weak to ${type}`}
              />
            ))
          ) : (
            // Recommendation only: show type-colored dots
            recommendedTypes.slice(0, 4).map((type) => (
              <span
                key={type}
                className={`w-3.5 h-3.5 rounded-full cursor-help ${TYPE_BG_COLORS[type]}`}
                title={`Covers ${type}`}
              />
            ))
          )}
        </div>
      )}
    </button>
  );
});
