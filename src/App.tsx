import { useMemo, useState } from 'react';
import { TeamBuilder } from './components/TeamBuilder';
import { PokedexGrid } from './components/PokedexGrid';
import { TypeCoverage } from './components/TypeCoverage';
import { WeaknessChart } from './components/WeaknessChart';
import { useTeam } from './hooks/useTeam';
import { useTypeCoverage } from './hooks/useTypeCoverage';
import { allPokemon } from './utils/loadPokemon';

function App() {
  const pokemonLookup = useMemo(() => {
    const map = new Map<number, (typeof allPokemon)[number]>();
    for (const pokemon of allPokemon) {
      map.set(pokemon.id, pokemon);
    }
    return map;
  }, []);

  const {
    team,
    removePokemon,
    toggleMega,
    clearTeam,
    togglePokemon,
    selectedIds,
    teamWeaknessCounts,
    copyShareUrl,
  } = useTeam(pokemonLookup);

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const {
    offensiveCoverage,
    offensiveGaps,
    weaknessAnalysis,
    teamResistances,
    teamImmunities,
    criticalWeaknesses,
    stackedWeaknesses,
  } = useTypeCoverage(team);

  const hasTeamMembers = team.some((slot) => slot !== null);

  const handleShare = async () => {
    const success = await copyShareUrl();
    setCopyFeedback(success ? 'Link copied!' : 'Failed to copy');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="bg-red-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Poke Party Planner</h1>
            <p className="text-red-100">Pokemon Legends Z-A Team Builder</p>
          </div>
          {hasTeamMembers && (
            <div className="relative">
              <button
                onClick={handleShare}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Share Team
              </button>
              {copyFeedback && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
                  {copyFeedback}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <section>
          <TeamBuilder
            team={team}
            onRemove={removePokemon}
            onToggleMega={toggleMega}
            onClear={clearTeam}
          />
        </section>

        {hasTeamMembers && (
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Type Coverage</h2>
              <TypeCoverage
                offensiveCoverage={offensiveCoverage}
                offensiveGaps={offensiveGaps}
                teamResistances={teamResistances}
                teamImmunities={teamImmunities}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Weakness Analysis</h2>
              <WeaknessChart
                weaknessAnalysis={weaknessAnalysis}
                criticalWeaknesses={criticalWeaknesses}
                stackedWeaknesses={stackedWeaknesses}
              />
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4">Pokedex</h2>
          <PokedexGrid
            pokemon={allPokemon}
            selectedIds={selectedIds}
            teamWeaknessCounts={teamWeaknessCounts}
            onSelect={togglePokemon}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
