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
          className={`rounded transition-all ${
            compact ? 'mt-1 p-0.5' : 'mt-2 p-1'
          } ${
            isMega
              ? 'bg-purple-500 hover:bg-purple-600 ring-2 ring-purple-300'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 opacity-50 hover:opacity-100'
          }`}
          title={isMega ? 'Disable Mega Evolution' : 'Enable Mega Evolution'}
        >
          <img
            src="/mega-icon.png"
            alt="Mega"
            className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${isMega ? '' : 'grayscale'}`}
          />
        </button>
      )}
    </div>
  );
}
