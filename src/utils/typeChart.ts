import type { PokemonType } from '../types/pokemon';
import typeData from '../data/types.json';

const typeChart = typeData.typeChart as Record<PokemonType, Record<PokemonType, number>>;
export const ALL_TYPES = typeData.allTypes as PokemonType[];

/**
 * Get the effectiveness multiplier when an attacking type hits a defending type
 * @returns 0, 0.5, 1, or 2
 */
export function getTypeEffectiveness(
  attackingType: PokemonType,
  defendingType: PokemonType
): number {
  return typeChart[attackingType]?.[defendingType] ?? 1;
}

/**
 * Calculate the effectiveness multiplier against a Pokemon with one or two types
 * @returns 0, 0.25, 0.5, 1, 2, or 4
 */
export function getEffectivenessAgainstTypes(
  attackingType: PokemonType,
  defendingTypes: PokemonType[]
): number {
  return defendingTypes.reduce((multiplier, defType) => {
    return multiplier * getTypeEffectiveness(attackingType, defType);
  }, 1);
}

/**
 * Get all weaknesses for a Pokemon's type combination
 * @returns Map of attacking types to their effectiveness multiplier (only >1)
 */
export function getWeaknesses(types: PokemonType[]): Map<PokemonType, number> {
  const weaknesses = new Map<PokemonType, number>();

  for (const attackType of ALL_TYPES) {
    const effectiveness = getEffectivenessAgainstTypes(attackType, types);
    if (effectiveness > 1) {
      weaknesses.set(attackType, effectiveness);
    }
  }

  return weaknesses;
}

/**
 * Get all resistances for a Pokemon's type combination
 * @returns Map of attacking types to their effectiveness multiplier (only <1 and >0)
 */
export function getResistances(types: PokemonType[]): Map<PokemonType, number> {
  const resistances = new Map<PokemonType, number>();

  for (const attackType of ALL_TYPES) {
    const effectiveness = getEffectivenessAgainstTypes(attackType, types);
    if (effectiveness < 1 && effectiveness > 0) {
      resistances.set(attackType, effectiveness);
    }
  }

  return resistances;
}

/**
 * Get all immunities for a Pokemon's type combination
 * @returns Array of types that deal 0x damage
 */
export function getImmunities(types: PokemonType[]): PokemonType[] {
  const immunities: PokemonType[] = [];

  for (const attackType of ALL_TYPES) {
    const effectiveness = getEffectivenessAgainstTypes(attackType, types);
    if (effectiveness === 0) {
      immunities.push(attackType);
    }
  }

  return immunities;
}

/**
 * Get types that an attacking type is super effective against
 * @returns Array of defending types that take 2x damage
 */
export function getSuperEffectiveAgainst(attackingType: PokemonType): PokemonType[] {
  const superEffective: PokemonType[] = [];

  for (const defType of ALL_TYPES) {
    if (getTypeEffectiveness(attackingType, defType) === 2) {
      superEffective.push(defType);
    }
  }

  return superEffective;
}

/**
 * Check if a Pokemon would add to existing team weaknesses
 * @returns Array of types that would become stacked weaknesses (2+ Pokemon weak)
 */
export function getStackedWeaknesses(
  existingWeaknessCounts: Map<PokemonType, number>,
  newPokemonTypes: PokemonType[],
  threshold: number = 2
): PokemonType[] {
  const newWeaknesses = getWeaknesses(newPokemonTypes);
  const stacked: PokemonType[] = [];

  for (const type of newWeaknesses.keys()) {
    const existingCount = existingWeaknessCounts.get(type) ?? 0;
    if (existingCount >= threshold - 1) {
      stacked.push(type);
    }
  }

  return stacked;
}


/**
 * Get which offensive gaps a Pokemon would fill with its types.
 * Returns the types from offensiveGaps that the Pokemon can hit super-effectively.
 */
export function getCoverageRecommendations(
  offensiveGaps: PokemonType[],
  pokemonTypes: PokemonType[]
): PokemonType[] {
  if (offensiveGaps.length === 0) return [];

  const gapsSet = new Set(offensiveGaps);
  const coveredGaps: PokemonType[] = [];

  for (const type of pokemonTypes) {
    const superEffective = getSuperEffectiveAgainst(type);
    for (const hitType of superEffective) {
      if (gapsSet.has(hitType) && !coveredGaps.includes(hitType)) {
        coveredGaps.push(hitType);
      }
    }
  }

  return coveredGaps;
}


/**
 * Get which attacking types are super-effective against a defending type.
 * This is the inverse of getSuperEffectiveAgainst.
 */
export function getTypesEffectiveAgainst(defendingType: PokemonType): PokemonType[] {
  const effectiveTypes: PokemonType[] = [];

  for (const attackType of ALL_TYPES) {
    if (getTypeEffectiveness(attackType, defendingType) === 2) {
      effectiveTypes.push(attackType);
    }
  }

  return effectiveTypes;
}

/**
 * Get recommended Pokemon types that would fill coverage gaps.
 * Returns a map of Pokemon type to the gap types it would cover.
 */
export function getRecommendedTypesForGaps(
  offensiveGaps: PokemonType[]
): Map<PokemonType, PokemonType[]> {
  const recommendations = new Map<PokemonType, PokemonType[]>();

  for (const gapType of offensiveGaps) {
    const effectiveTypes = getTypesEffectiveAgainst(gapType);
    for (const type of effectiveTypes) {
      const existing = recommendations.get(type) ?? [];
      if (!existing.includes(gapType)) {
        existing.push(gapType);
      }
      recommendations.set(type, existing);
    }
  }

  return recommendations;
}
