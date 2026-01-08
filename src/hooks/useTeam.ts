import { useState, useMemo, useCallback } from 'react';
import type { Pokemon, Team, TeamSlot, PokemonType } from '../types/pokemon';
import { getWeaknesses } from '../utils/typeChart';

const EMPTY_TEAM: Team = [null, null, null, null, null, null];

export function useTeam() {
  const [team, setTeam] = useState<Team>(EMPTY_TEAM);

  const addPokemon = useCallback((pokemon: Pokemon) => {
    setTeam((current) => {
      const emptyIndex = current.findIndex((slot) => slot === null);
      if (emptyIndex === -1) return current;

      const newTeam = [...current] as Team;
      newTeam[emptyIndex] = { pokemon, isMega: false };
      return newTeam;
    });
  }, []);

  const removePokemon = useCallback((index: number) => {
    setTeam((current) => {
      if (index < 0 || index >= 6 || current[index] === null) return current;

      const newTeam = [...current] as Team;
      newTeam[index] = null;
      return newTeam;
    });
  }, []);

  const toggleMega = useCallback((index: number) => {
    setTeam((current) => {
      const slot = current[index];
      if (!slot || !slot.pokemon.mega) return current;

      const newTeam = [...current] as Team;
      newTeam[index] = { ...slot, isMega: !slot.isMega };
      return newTeam;
    });
  }, []);

  const clearTeam = useCallback(() => {
    setTeam(EMPTY_TEAM);
  }, []);

  const togglePokemon = useCallback((pokemon: Pokemon) => {
    setTeam((current) => {
      const existingIndex = current.findIndex(
        (slot) => slot?.pokemon.id === pokemon.id
      );

      if (existingIndex !== -1) {
        const newTeam = [...current] as Team;
        newTeam[existingIndex] = null;
        return newTeam;
      }

      const emptyIndex = current.findIndex((slot) => slot === null);
      if (emptyIndex === -1) return current;

      const newTeam = [...current] as Team;
      newTeam[emptyIndex] = { pokemon, isMega: false };
      return newTeam;
    });
  }, []);

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

      const types = slot.isMega && slot.pokemon.mega
        ? slot.pokemon.mega.types
        : slot.pokemon.types;

      const weaknesses = getWeaknesses(types);
      for (const [type] of weaknesses) {
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
    clearTeam,
    togglePokemon,
    selectedIds,
    teamWeaknessCounts,
  };
}
