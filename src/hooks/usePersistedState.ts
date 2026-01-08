import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Team, Pokemon } from '../types/pokemon';
import { EMPTY_TEAM } from '../types/pokemon';
import { hydrateSlot, type SerializedSlot } from '../utils/teamHydration';
import {
  getTeamFromUrl,
  setTeamInUrl,
  getShareUrl,
} from '../utils/urlState';
import { debounce } from '../utils/debounce';

const STORAGE_KEY = 'poke-party-planner-team';

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

function deserializeTeamFromStorage(
  stored: string,
  pokemonLookup: Map<number, Pokemon>
): Team | null {
  try {
    const parsed = JSON.parse(stored) as (SerializedSlot | null)[];
    if (!Array.isArray(parsed) || parsed.length !== 6) return null;

    const team: Team = [null, null, null, null, null, null];

    for (let i = 0; i < 6; i++) {
      const slot = parsed[i];
      if (!slot) continue;
      team[i] = hydrateSlot(slot, pokemonLookup);
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
  const [team, setTeam] = useState<Team>(() =>
    getInitialTeam(pokemonLookup)
  );

  // Create debounced URL updater (stable reference)
  const debouncedSetTeamInUrl = useRef(
    debounce((t: Team) => setTeamInUrl(t), 300)
  ).current;

  // Sync to LocalStorage and URL on team changes
  useEffect(() => {
    // Save to LocalStorage immediately
    try {
      localStorage.setItem(STORAGE_KEY, serializeTeamForStorage(team));
    } catch {
      // LocalStorage not available
    }

    // Debounce URL updates to avoid excessive history state changes
    debouncedSetTeamInUrl(team);
  }, [team, debouncedSetTeamInUrl]);

  const shareUrl = useMemo(() => getShareUrl(team), [team]);

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
