import { useState, useMemo } from 'react';
import type { Pokemon, PokemonType } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import { TypeBadge } from './TypeBadge';
import { ALL_TYPES, getStackedWeaknesses, getCoverageRecommendations } from '../utils/typeChart';

interface PokedexGridProps {
  pokemon: Pokemon[];
  selectedIds: Set<number>;
  teamWeaknessCounts: Map<PokemonType, number>;
  offensiveGaps: PokemonType[];
  onSelect: (pokemon: Pokemon) => void;
  maxTeamSize?: number;
  typeFilter?: PokemonType | null;
  onTypeFilterChange?: (type: PokemonType | null) => void;
}

export function PokedexGrid({
  pokemon,
  selectedIds,
  teamWeaknessCounts,
  offensiveGaps,
  onSelect,
  maxTeamSize = 6,
  typeFilter: externalTypeFilter,
  onTypeFilterChange,
}: PokedexGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalTypeFilter, setInternalTypeFilter] = useState<PokemonType | null>(null);

  // Use external filter if provided, otherwise use internal state
  const typeFilter = externalTypeFilter !== undefined ? externalTypeFilter : internalTypeFilter;
  const setTypeFilter = onTypeFilterChange ?? setInternalTypeFilter;
  const [hideLowerEvolutions, setHideLowerEvolutions] = useState(false);
  const [hideWeaknessWarnings, setHideWeaknessWarnings] = useState(false);
  const [showMegasOnly, setShowMegasOnly] = useState(false);

  const getPokemonWarnings = (p: Pokemon): PokemonType[] => {
    if (selectedIds.has(p.id)) return [];
    return getStackedWeaknesses(teamWeaknessCounts, p.types, 3);
  };

  const getPokemonRecommendations = (p: Pokemon): PokemonType[] => {
    if (selectedIds.has(p.id)) return [];
    return getCoverageRecommendations(offensiveGaps, p.types);
  };

  const filteredPokemon = useMemo(() => {
    return pokemon.filter((p) => {
      const matchesSearch = p.displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = !typeFilter || p.types.includes(typeFilter);
      const matchesEvolution = !hideLowerEvolutions || p.isFinalEvolution;
      const matchesWeakness = !hideWeaknessWarnings || selectedIds.has(p.id) || getPokemonWarnings(p).length === 0;
      const matchesMega = !showMegasOnly || (p.megas && p.megas.length > 0);
      return matchesSearch && matchesType && matchesEvolution && matchesWeakness && matchesMega;
    });
  }, [pokemon, searchQuery, typeFilter, hideLowerEvolutions, hideWeaknessWarnings, showMegasOnly, selectedIds, teamWeaknessCounts]);

  const isTeamFull = selectedIds.size >= maxTeamSize;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1">
          <label htmlFor="pokemon-search" className="sr-only">Search Pokemon</label>
          <input
            id="pokemon-search"
            type="text"
            placeholder="Search Pokemon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <div>
          <label htmlFor="type-filter" className="sr-only">Filter by type</label>
          <select
            id="type-filter"
            value={typeFilter ?? ''}
            onChange={(e) => setTypeFilter(e.target.value as PokemonType || null)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="">All Types</option>
            {ALL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {typeFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filtering by:</span>
          <TypeBadge type={typeFilter} size="sm" />
          <button
            onClick={() => setTypeFilter(null)}
            className="text-sm text-blue-500 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={hideLowerEvolutions}
            onChange={(e) => setHideLowerEvolutions(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          Final evolutions only
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={hideWeaknessWarnings}
            onChange={(e) => setHideWeaknessWarnings(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          Hide weakness warnings
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showMegasOnly}
            onChange={(e) => setShowMegasOnly(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
          />
          Megas only
        </label>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredPokemon.length} of {pokemon.length} Pokemon
        {isTeamFull && (
          <span className="ml-2 text-orange-500">(Team full)</span>
        )}
      </div>

      <div
        className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 sm:gap-2"
        role="list"
        aria-label="Pokemon list"
      >
        {filteredPokemon.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            onClick={() => onSelect(p)}
            isSelected={selectedIds.has(p.id)}
            warningTypes={getPokemonWarnings(p)}
            recommendedTypes={getPokemonRecommendations(p)}
            disabled={isTeamFull && !selectedIds.has(p.id)}
          />
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <div className="text-center py-8 sm:py-12" role="status">
          <div className="text-4xl sm:text-5xl mb-3" aria-hidden="true">🔍</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            No Pokemon found matching your search.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter(null);
            }}
            className="mt-3 text-blue-500 hover:text-blue-600 text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
