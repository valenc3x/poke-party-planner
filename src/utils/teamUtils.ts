import type { TeamSlot, PokemonType } from '../types/pokemon';

/**
 * Get the active types for a team slot, accounting for mega evolution state.
 */
export function getActiveTypes(slot: TeamSlot): PokemonType[] {
  const mega = slot.pokemon.megas?.[slot.megaIndex];
  return slot.isMega && mega ? mega.types : slot.pokemon.types;
}

/**
 * Get the active display name for a team slot, accounting for mega evolution state.
 */
export function getActiveName(slot: TeamSlot): string {
  const mega = slot.pokemon.megas?.[slot.megaIndex];
  return slot.isMega && mega ? mega.displayName : slot.pokemon.displayName;
}
