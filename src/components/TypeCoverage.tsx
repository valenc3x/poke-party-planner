import type { PokemonType } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { ALL_TYPES } from '../utils/typeChart';

interface TypeCoverageProps {
  offensiveCoverage: Set<PokemonType>;
  offensiveGaps: PokemonType[];
  teamResistances: Set<PokemonType>;
  teamImmunities: Set<PokemonType>;
}

export function TypeCoverage({
  offensiveCoverage,
  offensiveGaps,
  teamResistances,
  teamImmunities,
}: TypeCoverageProps) {
  const coverageCount = offensiveCoverage.size;
  const totalTypes = ALL_TYPES.length;
  const coveragePercent = Math.round((coverageCount / totalTypes) * 100);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">
            Offensive Coverage
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {coverageCount}/{totalTypes} types ({coveragePercent}%)
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {ALL_TYPES.filter((t) => offensiveCoverage.has(t)).map((type) => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
      </div>

      {offensiveGaps.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Coverage Gaps
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Your team cannot hit these types super effectively:
          </p>
          <div className="flex flex-wrap gap-1">
            {offensiveGaps.map((type) => (
              <TypeBadge key={type} type={type} size="sm" variant="faded" />
            ))}
          </div>
        </div>
      )}

      {teamImmunities.size > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Immunities
          </h3>
          <div className="flex flex-wrap gap-1">
            {ALL_TYPES.filter((t) => teamImmunities.has(t)).map((type) => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </div>
      )}

      {teamResistances.size > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Resistances
          </h3>
          <div className="flex flex-wrap gap-1">
            {ALL_TYPES.filter((t) => teamResistances.has(t)).map((type) => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
