export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export interface MegaEvolution {
  variant: string | null;
  name: string;
  displayName: string;
  types: PokemonType[];
  sprite: string;
}

export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  sprite: string;
  megas?: MegaEvolution[];
}

export interface TeamSlot {
  pokemon: Pokemon;
  isMega: boolean;
  megaIndex: number;
}

export type Team = [
  TeamSlot | null,
  TeamSlot | null,
  TeamSlot | null,
  TeamSlot | null,
  TeamSlot | null,
  TeamSlot | null
];

export interface TypeEffectiveness {
  attacking: PokemonType;
  defending: PokemonType;
  multiplier: number;
}

export interface TypeCoverageResult {
  weaknesses: Map<PokemonType, number>;
  resistances: Map<PokemonType, number>;
  immunities: PokemonType[];
  offensiveCoverage: Map<PokemonType, number>;
}

export interface WeaknessAnalysis {
  type: PokemonType;
  count: number;
  pokemonNames: string[];
}
