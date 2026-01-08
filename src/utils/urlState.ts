import type { Team, TeamSlot, Pokemon } from '../types/pokemon';

const TEAM_PARAM = 'team';

/**
 * Serialized format for a team slot: "pokemonId.isMega.megaIndex"
 * Empty slots are represented as "0"
 * Full team example: "25.0.0-6.1.0-9.0.0-0-0-0"
 */

interface SerializedSlot {
  pokemonId: number;
  isMega: boolean;
  megaIndex: number;
}

function encodeSlot(slot: TeamSlot | null): string {
  if (!slot) return '0';
  const mega = slot.isMega ? 1 : 0;
  return `${slot.pokemon.id}.${mega}.${slot.megaIndex}`;
}

function decodeSlot(encoded: string): SerializedSlot | null {
  if (encoded === '0') return null;

  const parts = encoded.split('.');
  if (parts.length !== 3) return null;

  const pokemonId = parseInt(parts[0], 10);
  const isMega = parts[1] === '1';
  const megaIndex = parseInt(parts[2], 10);

  if (isNaN(pokemonId) || isNaN(megaIndex)) return null;

  return { pokemonId, isMega, megaIndex };
}

export function encodeTeamToUrl(team: Team): string {
  const encoded = team.map(encodeSlot).join('-');
  return encoded;
}

export function decodeTeamFromUrl(
  encoded: string,
  pokemonLookup: Map<number, Pokemon>
): Team {
  const parts = encoded.split('-');
  const team: Team = [null, null, null, null, null, null];

  for (let i = 0; i < 6; i++) {
    const part = parts[i];
    if (!part) continue;

    const decoded = decodeSlot(part);
    if (!decoded) continue;

    const pokemon = pokemonLookup.get(decoded.pokemonId);
    if (!pokemon) continue;

    // Validate mega settings
    const hasMegas = pokemon.megas && pokemon.megas.length > 0;
    const validMegaIndex =
      hasMegas && decoded.megaIndex < (pokemon.megas?.length ?? 0);

    team[i] = {
      pokemon,
      isMega: Boolean(hasMegas && decoded.isMega),
      megaIndex: validMegaIndex ? decoded.megaIndex : 0,
    };
  }

  return team;
}

export function getTeamFromUrl(pokemonLookup: Map<number, Pokemon>): Team | null {
  const params = new URLSearchParams(window.location.search);
  const teamParam = params.get(TEAM_PARAM);

  if (!teamParam) return null;

  return decodeTeamFromUrl(teamParam, pokemonLookup);
}

export function setTeamInUrl(team: Team): void {
  const encoded = encodeTeamToUrl(team);
  const url = new URL(window.location.href);

  // Only set if team has at least one Pokemon
  const hasContent = team.some((slot) => slot !== null);

  if (hasContent) {
    url.searchParams.set(TEAM_PARAM, encoded);
  } else {
    url.searchParams.delete(TEAM_PARAM);
  }

  window.history.replaceState({}, '', url.toString());
}

export function getShareUrl(team: Team): string {
  const encoded = encodeTeamToUrl(team);
  const url = new URL(window.location.origin + window.location.pathname);

  const hasContent = team.some((slot) => slot !== null);
  if (hasContent) {
    url.searchParams.set(TEAM_PARAM, encoded);
  }

  return url.toString();
}
