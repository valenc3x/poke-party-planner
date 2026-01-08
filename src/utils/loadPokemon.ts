import type { Pokemon, MegaEvolution } from '../types/pokemon';
import pokemonData from '../data/pokemon.json';
import megaData from '../data/megas.json';

const megaEvolutions = megaData.megaEvolutions as Record<string, MegaEvolution[]>;

export function loadPokemonWithMegas(): Pokemon[] {
  return pokemonData.pokemon.map((p) => {
    const megas = megaEvolutions[p.name];
    if (megas && megas.length > 0) {
      return {
        ...p,
        megas,
      } as Pokemon;
    }
    return p as Pokemon;
  });
}

export const allPokemon = loadPokemonWithMegas();
