import { useMemo, useState, useRef, useEffect } from 'react';
import { TeamBuilder } from './components/TeamBuilder';
import { PokedexGrid } from './components/PokedexGrid';
import { TypeCoverage } from './components/TypeCoverage';
import { WeaknessChart } from './components/WeaknessChart';
import { useTeam } from './hooks/useTeam';
import { useTypeCoverage } from './hooks/useTypeCoverage';
import { allPokemon } from './utils/loadPokemon';
import type { PokemonType } from './types/pokemon';

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
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [pokedexTypeFilter, setPokedexTypeFilter] = useState<PokemonType | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-white focus:text-red-600 focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <header className="bg-red-600 text-white py-3 sm:py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Poke Party Planner</h1>
            <p className="text-red-100 text-sm sm:text-base hidden xs:block">Pokemon Legends Z-A Team Builder</p>
          </div>
          {hasTeamMembers && (
            <div className="relative">
              <button
                onClick={handleShare}
                className="bg-white text-red-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors text-sm sm:text-base"
                aria-label="Share team link"
              >
                Share Team
              </button>
              <span
                role="status"
                aria-live="polite"
                className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap transition-opacity ${copyFeedback ? 'opacity-100' : 'opacity-0'}`}
              >
                {copyFeedback || ''}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} className="h-0" aria-hidden="true" />

      {/* Sticky team section */}
      <div
        className={`sticky top-0 z-10 bg-gray-100 dark:bg-gray-900 transition-shadow duration-200 ${
          isSticky ? 'shadow-md' : ''
        }`}
      >
        <div
          className={`container mx-auto px-4 transition-all duration-200 ${
            isSticky ? 'py-2' : 'py-4'
          }`}
        >
          <TeamBuilder
            team={team}
            onRemove={removePokemon}
            onToggleMega={toggleMega}
            onClear={clearTeam}
            compact={isSticky}
          />
        </div>
      </div>

      <main id="main-content" className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {hasTeamMembers && (
          <section>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-4 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-expanded={showAnalysis}
              aria-controls="type-analysis-content"
            >
              <span
                className={`transform transition-transform ${showAnalysis ? 'rotate-90' : ''}`}
                aria-hidden="true"
              >
                ▶
              </span>
              Type Analysis
            </button>

            {showAnalysis && (
              <div id="type-analysis-content" className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Type Coverage</h3>
                  <TypeCoverage
                    offensiveCoverage={offensiveCoverage}
                    offensiveGaps={offensiveGaps}
                    teamResistances={teamResistances}
                    teamImmunities={teamImmunities}
                    onTypeClick={setPokedexTypeFilter}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Weakness Analysis</h3>
                  <WeaknessChart
                    weaknessAnalysis={weaknessAnalysis}
                    criticalWeaknesses={criticalWeaknesses}
                    stackedWeaknesses={stackedWeaknesses}
                  />
                </div>
              </div>
            )}
          </section>
        )}

        <section aria-labelledby="pokedex-heading">
          <h2 id="pokedex-heading" className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Pokedex</h2>
          <PokedexGrid
            pokemon={allPokemon}
            selectedIds={selectedIds}
            teamWeaknessCounts={teamWeaknessCounts}
            offensiveGaps={offensiveGaps}
            onSelect={togglePokemon}
            typeFilter={pokedexTypeFilter}
            onTypeFilterChange={setPokedexTypeFilter}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
