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
    <div className={`transition-all duration-200 ${compact ? 'space-y-2' : 'space-y-4'}`}>
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold ${compact ? 'text-base' : 'text-xl'}`}>
          Your Team ({filledSlots}/6)
        </h2>
        {filledSlots > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-red-500 hover:text-red-600 hover:underline"
          >
            Clear Team
          </button>
        )}
      </div>

      <div className={`grid grid-cols-3 sm:grid-cols-6 ${compact ? 'gap-2' : 'gap-3'}`}>
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
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Select Pokemon from the Pokedex below to build your team
        </p>
      )}
    </div>
  );
}
