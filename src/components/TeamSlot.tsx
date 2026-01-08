import type { TeamSlot as TeamSlotType, PokemonType } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';

interface TeamSlotProps {
  slot: TeamSlotType | null;
  index: number;
  onRemove: () => void;
  onToggleMega: () => void;
}

export function TeamSlot({ slot, index, onRemove, onToggleMega }: TeamSlotProps) {
  if (!slot) {
    return (
      <div className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 min-h-[140px]">
        <span className="text-gray-400 dark:text-gray-500 text-sm">
          Slot {index + 1}
        </span>
        <span className="text-gray-300 dark:text-gray-600 text-xs mt-1">
          Empty
        </span>
      </div>
    );
  }

  const { pokemon, isMega, megaIndex } = slot;
  const mega = pokemon.megas?.[megaIndex];
  const hasMega = !!mega;
  const currentTypes: PokemonType[] = isMega && mega ? mega.types : pokemon.types;
  const currentSprite = isMega && mega ? mega.sprite : pokemon.sprite;
  const currentName = isMega && mega ? mega.displayName : pokemon.displayName;

  return (
    <div className="relative flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[140px]">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors"
        title="Remove from team"
      >
        ×
      </button>

      <img
        src={currentSprite}
        alt={currentName}
        className="w-16 h-16 object-contain"
      />

      <span className="text-sm font-medium mt-1 text-center leading-tight">
        {currentName}
      </span>

      <div className="flex gap-1 mt-1 flex-wrap justify-center">
        {currentTypes.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>

      {hasMega && (
        <button
          onClick={onToggleMega}
          className={`
            mt-2 px-2 py-0.5 text-xs font-medium rounded transition-colors
            ${isMega
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900'
            }
          `}
        >
          {isMega ? 'Mega ✓' : 'Mega'}
        </button>
      )}
    </div>
  );
}
