import { useState, useEffect, useCallback } from 'react';
import type { Team, Pokemon } from '../types/pokemon';
import {
  getTeamFromUrl,
  setTeamInUrl,
  getShareUrl,
} from '../utils/urlState';

const STORAGE_KEY = 'poke-party-planner-team';
const EMPTY_TEAM: Team = [null, null, null, null, null, null];

function serializeTeamForStorage(team: Team): string {
  return JSON.stringify(
    team.map((slot) =>
      slot
        ? {
            pokemonId: slot.pokemon.id,
            isMega: slot.isMega,
            megaIndex: slot.megaIndex,
          }
        : null
    )
  );
}

interface StoredSlot {
  pokemonId: number;
  isMega: boolean;
  megaIndex: number;
}

function deserializeTeamFromStorage(
  stored: string,
  pokemonLookup: Map<number, Pokemon>
): Team | null {
  try {
    const parsed = JSON.parse(stored) as (StoredSlot | null)[];
    if (!Array.isArray(parsed) || parsed.length !== 6) return null;

    const team: Team = [null, null, null, null, null, null];

    for (let i = 0; i < 6; i++) {
      const slot = parsed[i];
      if (!slot) continue;

      const pokemon = pokemonLookup.get(slot.pokemonId);
      if (!pokemon) continue;

      const hasMegas = pokemon.megas && pokemon.megas.length > 0;
      const validMegaIndex =
        hasMegas && slot.megaIndex < (pokemon.megas?.length ?? 0);

      team[i] = {
        pokemon,
        isMega: Boolean(hasMegas && slot.isMega),
        megaIndex: validMegaIndex ? slot.megaIndex : 0,
      };
    }

    return team;
  } catch {
    return null;
  }
}

function getInitialTeam(pokemonLookup: Map<number, Pokemon>): Team {
  // Priority 1: URL params (for shared links)
  const urlTeam = getTeamFromUrl(pokemonLookup);
  if (urlTeam && urlTeam.some((slot) => slot !== null)) {
    return urlTeam;
  }

  // Priority 2: LocalStorage (for returning users)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storageTeam = deserializeTeamFromStorage(stored, pokemonLookup);
      if (storageTeam && storageTeam.some((slot) => slot !== null)) {
        return storageTeam;
      }
    }
  } catch {
    // LocalStorage not available or corrupted
  }

  // Default: empty team
  return EMPTY_TEAM;
}

export interface UsePersistedTeamReturn {
  team: Team;
  setTeam: (team: Team | ((prev: Team) => Team)) => void;
  shareUrl: string;
  copyShareUrl: () => Promise<boolean>;
}

export function usePersistedTeam(
  pokemonLookup: Map<number, Pokemon>
): UsePersistedTeamReturn {
  const [team, setTeamState] = useState<Team>(() =>
    getInitialTeam(pokemonLookup)
  );

  // Sync to LocalStorage and URL on team changes
  useEffect(() => {
    // Save to LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, serializeTeamForStorage(team));
    } catch {
      // LocalStorage not available
    }

    // Update URL
    setTeamInUrl(team);
  }, [team]);

  const setTeam = useCallback(
    (newTeam: Team | ((prev: Team) => Team)) => {
      setTeamState(newTeam);
    },
    []
  );

  const shareUrl = getShareUrl(team);

  const copyShareUrl = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch {
      return false;
    }
  }, [shareUrl]);

  return {
    team,
    setTeam,
    shareUrl,
    copyShareUrl,
  };
}
