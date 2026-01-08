import { TeamBuilder } from './components/TeamBuilder';
import { PokedexGrid } from './components/PokedexGrid';
import { TypeCoverage } from './components/TypeCoverage';
import { WeaknessChart } from './components/WeaknessChart';
import { useTeam } from './hooks/useTeam';
import { useTypeCoverage } from './hooks/useTypeCoverage';
import { allPokemon } from './utils/loadPokemon';

function App() {
  const {
    team,
    removePokemon,
    toggleMega,
    clearTeam,
    togglePokemon,
    selectedIds,
    teamWeaknessCounts,
  } = useTeam();

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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="bg-red-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Poke Party Planner</h1>
          <p className="text-red-100">Pokemon Legends Z-A Team Builder</p>
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
