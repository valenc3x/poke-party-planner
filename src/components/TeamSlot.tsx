import type { TeamSlot as TeamSlotType, PokemonType } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';

interface TeamSlotProps {
  slot: TeamSlotType | null;
  index: number;
  onRemove: () => void;
  onToggleMega: () => void;
  compact?: boolean;
}

export function TeamSlot({
  slot,
  index,
  onRemove,
  onToggleMega,
  compact = false,
}: TeamSlotProps) {
  if (!slot) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 ${
          compact ? 'p-2 min-h-[80px]' : 'p-3 min-h-[140px]'
        }`}
      >
        <span
          className={`text-gray-400 dark:text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}
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

  const { pokemon, isMega, megaIndex } = slot;
  const mega = pokemon.megas?.[megaIndex];
  const hasMega = !!mega;
  const currentTypes: PokemonType[] = isMega && mega ? mega.types : pokemon.types;
  const currentSprite = isMega && mega ? mega.sprite : pokemon.sprite;
  const currentName = isMega && mega ? mega.displayName : pokemon.displayName;

  return (
    <div
      className={`relative flex flex-col items-center rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
        compact ? 'p-1.5 min-h-[80px]' : 'p-3 min-h-[140px]'
      }`}
    >
      <button
        onClick={onRemove}
        className={`absolute bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors ${
          compact
            ? '-top-1.5 -right-1.5 w-5 h-5 text-xs'
            : '-top-2 -right-2 w-6 h-6 text-sm'
        }`}
        title="Remove from team"
      >
        ×
      </button>

      <img
        src={currentSprite}
        alt={currentName}
        className={`object-contain ${compact ? 'w-10 h-10' : 'w-16 h-16'}`}
      />

      <span
        className={`font-medium text-center leading-tight ${
          compact ? 'text-xs mt-0.5' : 'text-sm mt-1'
        }`}
      >
        {compact ? pokemon.displayName.split(' ')[0] : currentName}
      </span>

      <div
        className={`flex gap-0.5 flex-wrap justify-center ${compact ? 'mt-0.5' : 'mt-1'}`}
      >
        {currentTypes.map((type) => (
          <TypeBadge key={type} type={type} size="xs" />
        ))}
      </div>

      {hasMega && (
        <button
          onClick={onToggleMega}
          className={`font-medium rounded transition-colors ${
            compact ? 'mt-1 px-1.5 py-0.5 text-[10px]' : 'mt-2 px-2 py-0.5 text-xs'
          } ${
            isMega
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900'
          }`}
        >
          {isMega ? 'M' : 'M'}
        </button>
      )}
    </div>
  );
}
