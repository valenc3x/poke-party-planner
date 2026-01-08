import { useState, useMemo } from 'react';
import type { Pokemon, PokemonType } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import { TypeBadge } from './TypeBadge';
import { ALL_TYPES, getStackedWeaknesses } from '../utils/typeChart';

interface PokedexGridProps {
  pokemon: Pokemon[];
  selectedIds: Set<number>;
  teamWeaknessCounts: Map<PokemonType, number>;
  onSelect: (pokemon: Pokemon) => void;
  maxTeamSize?: number;
}

export function PokedexGrid({
  pokemon,
  selectedIds,
  teamWeaknessCounts,
  onSelect,
  maxTeamSize = 6,
}: PokedexGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PokemonType | null>(null);

  const filteredPokemon = useMemo(() => {
    return pokemon.filter((p) => {
      const matchesSearch = p.displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = !typeFilter || p.types.includes(typeFilter);
      return matchesSearch && matchesType;
    });
  }, [pokemon, searchQuery, typeFilter]);

  const getPokemonWarnings = (p: Pokemon): PokemonType[] => {
    if (selectedIds.has(p.id)) return [];
    return getStackedWeaknesses(teamWeaknessCounts, p.types, 3);
  };

  const isTeamFull = selectedIds.size >= maxTeamSize;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search Pokemon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={typeFilter ?? ''}
          onChange={(e) => setTypeFilter(e.target.value as PokemonType || null)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {ALL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
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

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredPokemon.length} of {pokemon.length} Pokemon
        {isTeamFull && (
          <span className="ml-2 text-orange-500">(Team full)</span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {filteredPokemon.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            onClick={() => onSelect(p)}
            isSelected={selectedIds.has(p.id)}
            warningTypes={getPokemonWarnings(p)}
            disabled={isTeamFull && !selectedIds.has(p.id)}
          />
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No Pokemon found matching your search.
        </div>
      )}
    </div>
  );
}
