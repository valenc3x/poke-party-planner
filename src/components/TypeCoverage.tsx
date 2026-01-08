import type { PokemonType } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { ALL_TYPES, getRecommendedTypesForGaps } from '../utils/typeChart';

interface TypeCoverageProps {
  offensiveCoverage: Set<PokemonType>;
  offensiveGaps: PokemonType[];
  teamResistances: Set<PokemonType>;
  teamImmunities: Set<PokemonType>;
  onTypeClick?: (type: PokemonType) => void;
}

export function TypeCoverage({
  offensiveCoverage,
  offensiveGaps,
  teamResistances,
  teamImmunities,
  onTypeClick,
}: TypeCoverageProps) {
  const coverageCount = offensiveCoverage.size;
  const totalTypes = ALL_TYPES.length;
  const coveragePercent = Math.round((coverageCount / totalTypes) * 100);

  // Get recommended types that would fill coverage gaps
  const recommendedTypes = getRecommendedTypesForGaps(offensiveGaps);
  // Sort by how many gaps each type covers (most coverage first)
  const sortedRecommendations = Array.from(recommendedTypes.entries())
    .sort((a, b) => b[1].length - a[1].length);

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

      {sortedRecommendations.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recommended Types
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {onTypeClick ? 'Click to filter Pokedex by type:' : 'Consider adding Pokemon of these types to fill your coverage gaps:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {sortedRecommendations.map(([type, coversGaps]) => (
              <button
                key={type}
                onClick={() => onTypeClick?.(type)}
                className={`flex items-center gap-1 rounded-md transition-all ${
                  onTypeClick
                    ? 'hover:scale-105 hover:shadow-md cursor-pointer'
                    : 'cursor-default'
                }`}
                title={`Filter Pokedex by ${type} type (covers ${coversGaps.join(', ')})`}
              >
                <TypeBadge type={type} size="sm" />
                <span className="text-xs text-gray-500 dark:text-gray-400 pr-1">
                  ({coversGaps.length})
                </span>
              </button>
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
