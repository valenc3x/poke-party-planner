import { useMemo } from 'react';
import type { Team, PokemonType, WeaknessAnalysis } from '../types/pokemon';
import {
  ALL_TYPES,
  getWeaknesses,
  getResistances,
  getImmunities,
  getSuperEffectiveAgainst,
} from '../utils/typeChart';
import { getActiveTypes, getActiveName } from '../utils/teamUtils';

interface TypeCoverageAnalysis {
  /** Types the team can hit super effectively */
  offensiveCoverage: Set<PokemonType>;
  /** Types not covered by any team member */
  offensiveGaps: PokemonType[];
  /** Team weaknesses with count and which Pokemon are weak */
  weaknessAnalysis: WeaknessAnalysis[];
  /** Types the team resists (at least one member) */
  teamResistances: Set<PokemonType>;
  /** Types the team is immune to (at least one member) */
  teamImmunities: Set<PokemonType>;
  /** Types where 3+ Pokemon are weak (danger zone) */
  criticalWeaknesses: WeaknessAnalysis[];
  /** Types where 2 Pokemon are weak (warning zone) */
  stackedWeaknesses: WeaknessAnalysis[];
}

export function useTypeCoverage(team: Team): TypeCoverageAnalysis {
  return useMemo(() => {
    const offensiveCoverage = new Set<PokemonType>();
    const teamResistances = new Set<PokemonType>();
    const teamImmunities = new Set<PokemonType>();
    const weaknessCounts = new Map<PokemonType, string[]>();

    for (const slot of team) {
      if (!slot) continue;

      const types = getActiveTypes(slot);
      const name = getActiveName(slot);

      // Calculate offensive coverage from Pokemon's types
      for (const type of types) {
        const superEffective = getSuperEffectiveAgainst(type);
        for (const effective of superEffective) {
          offensiveCoverage.add(effective);
        }
      }

      // Calculate defensive properties
      const weaknesses = getWeaknesses(types);
      for (const weakType of weaknesses.keys()) {
        const current = weaknessCounts.get(weakType) ?? [];
        current.push(name);
        weaknessCounts.set(weakType, current);
      }

      const resistances = getResistances(types);
      for (const resistType of resistances.keys()) {
        teamResistances.add(resistType);
      }

      const immunities = getImmunities(types);
      for (const immuneType of immunities) {
        teamImmunities.add(immuneType);
      }
    }

    // Calculate offensive gaps
    const offensiveGaps = ALL_TYPES.filter((type) => !offensiveCoverage.has(type));

    // Build weakness analysis
    const weaknessAnalysis: WeaknessAnalysis[] = [];
    for (const [type, pokemonNames] of weaknessCounts) {
      weaknessAnalysis.push({
        type,
        count: pokemonNames.length,
        pokemonNames,
      });
    }
    weaknessAnalysis.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));

    // Separate critical (3+) and stacked (2) weaknesses
    const criticalWeaknesses = weaknessAnalysis.filter((w) => w.count >= 3);
    const stackedWeaknesses = weaknessAnalysis.filter((w) => w.count === 2);

    return {
      offensiveCoverage,
      offensiveGaps,
      weaknessAnalysis,
      teamResistances,
      teamImmunities,
      criticalWeaknesses,
      stackedWeaknesses,
    };
  }, [team]);
}
