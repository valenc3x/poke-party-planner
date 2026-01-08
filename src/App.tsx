import { TeamBuilder } from './components/TeamBuilder';
import { PokedexGrid } from './components/PokedexGrid';
import { useTeam } from './hooks/useTeam';
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
