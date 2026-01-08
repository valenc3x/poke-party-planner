import type { Team } from '../types/pokemon';
import { TeamSlot } from './TeamSlot';

interface TeamBuilderProps {
  team: Team;
  onRemove: (index: number) => void;
  onToggleMega: (index: number) => void;
  onClear: () => void;
  compact?: boolean;
}

export function TeamBuilder({
  team,
  onRemove,
  onToggleMega,
  onClear,
  compact = false,
}: TeamBuilderProps) {
  const filledSlots = team.filter((slot) => slot !== null).length;

  return (
    <div className={`transition-all duration-200 ${compact ? 'space-y-1.5 sm:space-y-2' : 'space-y-3 sm:space-y-4'}`}>
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold ${compact ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'}`}>
          Your Team <span aria-live="polite">({filledSlots}/6)</span>
        </h2>
        {filledSlots > 0 && (
          <button
            onClick={onClear}
            className="text-xs sm:text-sm text-red-500 hover:text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 rounded px-1"
            aria-label="Clear all Pokemon from team"
          >
            Clear Team
          </button>
        )}
      </div>

      <div
        className={`grid grid-cols-3 sm:grid-cols-6 ${compact ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-3'}`}
        role="list"
        aria-label="Team slots"
      >
        {team.map((slot, index) => (
          <TeamSlot
            key={index}
            slot={slot}
            index={index}
            onRemove={() => onRemove(index)}
            onToggleMega={() => onToggleMega(index)}
            compact={compact}
          />
        ))}
      </div>

      {!compact && filledSlots === 0 && (
        <div className="text-center py-2">
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            Select Pokemon from the Pokedex below to build your team
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Click on any Pokemon card to add it to your party
          </p>
        </div>
      )}
    </div>
  );
}
