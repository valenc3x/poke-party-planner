import type { Team } from '../types/pokemon';
import { TeamSlot } from './TeamSlot';

interface TeamBuilderProps {
  team: Team;
  onRemove: (index: number) => void;
  onToggleMega: (index: number) => void;
  onClear: () => void;
}

export function TeamBuilder({
  team,
  onRemove,
  onToggleMega,
  onClear,
}: TeamBuilderProps) {
  const filledSlots = team.filter((slot) => slot !== null).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {team.map((slot, index) => (
          <TeamSlot
            key={index}
            slot={slot}
            index={index}
            onRemove={() => onRemove(index)}
            onToggleMega={() => onToggleMega(index)}
          />
        ))}
      </div>

      {filledSlots === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Select Pokemon from the Pokedex below to build your team
        </p>
      )}
    </div>
  );
}
