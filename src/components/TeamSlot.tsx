import { memo } from 'react';
import type { TeamSlot as TeamSlotType, PokemonType } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';

interface TeamSlotProps {
  slot: TeamSlotType | null;
  index: number;
  onRemove: () => void;
  onToggleMega: () => void;
  onToggleShiny: () => void;
  compact?: boolean;
}

export const TeamSlot = memo(function TeamSlot({
  slot,
  index,
  onRemove,
  onToggleMega,
  onToggleShiny,
  compact = false,
}: TeamSlotProps) {
  if (!slot) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 transition-all duration-200 ${
          compact ? 'p-1.5 sm:p-2 min-h-[70px] sm:min-h-[80px]' : 'p-3 sm:p-4 min-h-[160px] sm:min-h-[200px]'
        }`}
        role="listitem"
        aria-label={`Team slot ${index + 1}, empty`}
      >
        <span
          className={`text-gray-400 dark:text-gray-500 ${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'}`}
        >
          Slot {index + 1}
        </span>
        {!compact && (
          <span className="text-gray-300 dark:text-gray-600 text-xs mt-1">
            Empty
          </span>
        )}
      </div>
    );
  }

  const { pokemon, isMega, megaIndex, isShiny } = slot;
  const mega = pokemon.megas?.[megaIndex];
  const hasMega = !!mega;
  const currentTypes: PokemonType[] = isMega && mega ? mega.types : pokemon.types;
  const currentName = isMega && mega ? mega.displayName : pokemon.displayName;

  // Determine sprite based on mega and shiny state
  const baseSprite = isMega && mega ? mega.sprite : pokemon.sprite;
  const shinySprite = isMega && mega ? mega.shinySprite : pokemon.shinySprite;
  const currentSprite = isShiny ? shinySprite : baseSprite;

  return (
    <div
      className={`relative flex flex-col items-center rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 ${
        compact ? 'p-1 sm:p-1.5 min-h-[70px] sm:min-h-[80px]' : 'p-3 sm:p-4 min-h-[160px] sm:min-h-[200px]'
      }`}
      role="listitem"
      aria-label={`${currentName}, ${currentTypes.join(' and ')} type${isMega ? ', Mega form active' : ''}${isShiny ? ', Shiny' : ''}`}
    >
      <button
        onClick={onRemove}
        className={`absolute bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
          compact
            ? '-top-1.5 -right-1.5 w-5 h-5 text-xs'
            : '-top-2 sm:-top-2.5 -right-2 sm:-right-2.5 w-6 sm:w-7 h-6 sm:h-7 text-sm sm:text-base'
        }`}
        aria-label={`Remove ${pokemon.displayName} from team`}
      >
        <span aria-hidden="true">×</span>
      </button>

      <img
        src={currentSprite}
        alt=""
        aria-hidden="true"
        className={`object-contain transition-all duration-200 ${compact ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-16 h-16 sm:w-24 sm:h-24'}`}
      />

      <span
        className={`font-medium text-center leading-tight ${
          compact ? 'text-[10px] sm:text-xs mt-0.5' : 'text-sm sm:text-base mt-1 sm:mt-2'
        }`}
      >
        {compact ? pokemon.displayName.split(' ')[0] : currentName}
      </span>

      <div
        className={`flex flex-wrap justify-center ${compact ? 'gap-0.5 mt-0.5' : 'gap-0.5 sm:gap-1 mt-1 sm:mt-2'}`}
        aria-hidden="true"
      >
        {currentTypes.map((type) => (
          <TypeBadge key={type} type={type} size={compact ? 'xs' : 'sm'} />
        ))}
      </div>

      <div className={`flex gap-1 ${compact ? 'mt-0.5 sm:mt-1' : 'mt-2 sm:mt-3'}`}>
        {hasMega && (
          <button
            onClick={onToggleMega}
            className={`rounded transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${
              compact ? 'p-0.5' : 'p-1 sm:p-1.5'
            } ${
              isMega
                ? 'bg-purple-500 hover:bg-purple-600 ring-2 ring-purple-300'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 opacity-50 hover:opacity-100'
            }`}
            aria-label={isMega ? `Disable Mega Evolution for ${pokemon.displayName}` : `Enable Mega Evolution for ${pokemon.displayName}`}
            aria-pressed={isMega}
          >
            <img
              src="/mega-icon.png"
              alt=""
              aria-hidden="true"
              className={`${compact ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-5 h-5 sm:w-6 sm:h-6'} ${isMega ? '' : 'grayscale'}`}
            />
          </button>
        )}
        <button
          onClick={onToggleShiny}
          className={`rounded transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 ${
            compact ? 'p-0.5' : 'p-1 sm:p-1.5'
          } ${
            isShiny
              ? 'bg-yellow-400 hover:bg-yellow-500 ring-2 ring-yellow-300'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900 opacity-50 hover:opacity-100'
          }`}
          aria-label={isShiny ? `Disable Shiny for ${pokemon.displayName}` : `Enable Shiny for ${pokemon.displayName}`}
          aria-pressed={isShiny}
        >
          <span
            className={`${compact ? 'text-xs' : 'text-sm sm:text-base'} ${isShiny ? '' : 'grayscale opacity-60'}`}
            aria-hidden="true"
          >
            ✨
          </span>
        </button>
      </div>
    </div>
  );
});
