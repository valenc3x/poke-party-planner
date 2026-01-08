import type { Pokemon, TeamSlot } from '../types/pokemon';

export interface SerializedSlot {
  pokemonId: number;
  isMega: boolean;
  megaIndex: number;
}

/**
 * Hydrates a serialized slot into a full TeamSlot with Pokemon reference.
 * Validates mega settings against the actual Pokemon data.
 */
export function hydrateSlot(
  slot: SerializedSlot,
  pokemonLookup: Map<number, Pokemon>
): TeamSlot | null {
  const pokemon = pokemonLookup.get(slot.pokemonId);
  if (!pokemon) return null;

  const hasMegas = pokemon.megas && pokemon.megas.length > 0;
  const validMegaIndex =
    hasMegas && slot.megaIndex < (pokemon.megas?.length ?? 0);

  return {
    pokemon,
    isMega: Boolean(hasMegas && slot.isMega),
    megaIndex: validMegaIndex ? slot.megaIndex : 0,
  };
}
