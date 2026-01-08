import { useMemo, useCallback } from 'react';
import type { Pokemon, Team, TeamSlot, PokemonType } from '../types/pokemon';
import { EMPTY_TEAM } from '../types/pokemon';
import { getWeaknesses } from '../utils/typeChart';
import { getActiveTypes } from '../utils/teamUtils';
import { usePersistedTeam } from './usePersistedState';

function copyTeam(team: Team): Team {
  return [...team] as Team;
}

export function useTeam(pokemonLookup: Map<number, Pokemon>) {
  const { team, setTeam, shareUrl, copyShareUrl } =
    usePersistedTeam(pokemonLookup);

  const addPokemon = useCallback((pokemon: Pokemon) => {
    setTeam((current) => {
      const emptyIndex = current.findIndex((slot) => slot === null);
      if (emptyIndex === -1) return current;

      const newTeam = copyTeam(current);
      newTeam[emptyIndex] = { pokemon, isMega: false, megaIndex: 0, isShiny: false };
      return newTeam;
    });
  }, [setTeam]);

  const removePokemon = useCallback((index: number) => {
    setTeam((current) => {
      if (index < 0 || index >= 6 || current[index] === null) return current;

      const newTeam = copyTeam(current);
      newTeam[index] = null;
      return newTeam;
    });
  }, [setTeam]);

  const toggleMega = useCallback((index: number) => {
    setTeam((current) => {
      const slot = current[index];
      const megas = slot?.pokemon.megas;
      if (!slot || !megas?.length) return current;

      const newTeam = copyTeam(current);

      if (!slot.isMega) {
        // Activate mega form
        newTeam[index] = { ...slot, isMega: true, megaIndex: 0 };
      } else if (megas.length > 1 && slot.megaIndex < megas.length - 1) {
        // Cycle to next mega variant (e.g., Charizard X -> Y)
        newTeam[index] = { ...slot, megaIndex: slot.megaIndex + 1 };
      } else {
        // Deactivate mega form
        newTeam[index] = { ...slot, isMega: false, megaIndex: 0 };
      }

      return newTeam;
    });
  }, [setTeam]);

  const toggleShiny = useCallback((index: number) => {
    setTeam((current) => {
      const slot = current[index];
      if (!slot) return current;

      const newTeam = copyTeam(current);
      newTeam[index] = { ...slot, isShiny: !slot.isShiny };
      return newTeam;
    });
  }, [setTeam]);

  const clearTeam = useCallback(() => {
    setTeam(EMPTY_TEAM);
  }, [setTeam]);

  const togglePokemon = useCallback((pokemon: Pokemon) => {
    setTeam((current) => {
      const existingIndex = current.findIndex(
        (slot) => slot?.pokemon.id === pokemon.id
      );

      if (existingIndex !== -1) {
        const newTeam = copyTeam(current);
        newTeam[existingIndex] = null;
        return newTeam;
      }

      const emptyIndex = current.findIndex((slot) => slot === null);
      if (emptyIndex === -1) return current;

      const newTeam = copyTeam(current);
      newTeam[emptyIndex] = { pokemon, isMega: false, megaIndex: 0, isShiny: false };
      return newTeam;
    });
  }, [setTeam]);

  const selectedIds = useMemo(() => {
    return new Set(
      team
        .filter((slot): slot is TeamSlot => slot !== null)
        .map((slot) => slot.pokemon.id)
    );
  }, [team]);

  const teamWeaknessCounts = useMemo(() => {
    const counts = new Map<PokemonType, number>();

    for (const slot of team) {
      if (!slot) continue;

      const types = getActiveTypes(slot);
      const weaknesses = getWeaknesses(types);
      for (const type of weaknesses.keys()) {
        counts.set(type, (counts.get(type) ?? 0) + 1);
      }
    }

    return counts;
  }, [team]);

  return {
    team,
    addPokemon,
    removePokemon,
    toggleMega,
    toggleShiny,
    clearTeam,
    togglePokemon,
    selectedIds,
    teamWeaknessCounts,
    shareUrl,
    copyShareUrl,
  };
}
