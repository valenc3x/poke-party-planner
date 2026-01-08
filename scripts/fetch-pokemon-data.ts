/**
 * Fetch Pokemon data from PokeAPI for Pokemon Legends Z-A
 *
 * This script fetches Pokemon data from the PokeAPI and generates:
 * - src/data/pokemon.json - All Pokemon in the Pokedex
 * - src/data/megas.json - Mega evolution mappings
 * - public/sprites/*.png - Pokemon sprite images
 *
 * Usage: npm run fetch-data
 */

import * as fs from 'fs';
import * as path from 'path';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
// Pokemon Legends Z-A uses two Pokedex IDs
const POKEDEX_IDS = [34, 35];

// Output paths
const DATA_DIR = path.join(process.cwd(), 'src/data');
const SPRITES_DIR = path.join(process.cwd(), 'public/sprites');

interface PokeAPIPokedex {
  name: string;
  pokemon_entries: Array<{
    entry_number: number;
    pokemon_species: {
      name: string;
      url: string;
    };
  }>;
}

interface PokeAPISpecies {
  name: string;
  id: number;
  varieties: Array<{
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    };
  }>;
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
}

interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  types: string[];
  sprite: string;
  megas?: MegaEvolution[];
}

interface MegaEvolution {
  variant: string | null;
  name: string;
  displayName: string;
  types: string[];
  sprite: string;
}

interface PokedexEntry {
  name: string;
  url: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function downloadSprite(url: string, filename: string): Promise<void> {
  const filepath = path.join(SPRITES_DIR, filename);
  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    return;
  }
  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`  Warning: Could not download sprite from ${url}`);
    return;
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

function formatDisplayName(name: string): string {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getMegaVariant(name: string): string | null {
  if (name.includes('-mega-x')) return 'x';
  if (name.includes('-mega-y')) return 'y';
  return null;
}

async function fetchPokemonData(speciesUrl: string): Promise<Pokemon | null> {
  try {
    const species = await fetchJson<PokeAPISpecies>(speciesUrl);

    // Find the default variety (base form)
    const defaultVariety = species.varieties.find(v => v.is_default);
    if (!defaultVariety) {
      console.warn(`  No default variety for ${species.name}`);
      return null;
    }

    const pokemon = await fetchJson<PokeAPIPokemon>(defaultVariety.pokemon.url);

    // Get sprite URL (prefer official artwork, fallback to front_default)
    const spriteUrl =
      pokemon.sprites.other?.['official-artwork']?.front_default ||
      pokemon.sprites.front_default;

    if (!spriteUrl) {
      console.warn(`  No sprite for ${pokemon.name}`);
      return null;
    }

    // Download sprite
    const spriteFilename = `${pokemon.name}.png`;
    await downloadSprite(spriteUrl, spriteFilename);

    // Find mega evolutions
    const megas: MegaEvolution[] = [];
    for (const variety of species.varieties) {
      if (variety.pokemon.name.includes('-mega')) {
        const megaPokemon = await fetchJson<PokeAPIPokemon>(variety.pokemon.url);
        const megaSpriteUrl =
          megaPokemon.sprites.other?.['official-artwork']?.front_default ||
          megaPokemon.sprites.front_default;

        if (megaSpriteUrl) {
          const megaSpriteFilename = `${megaPokemon.name}.png`;
          await downloadSprite(megaSpriteUrl, megaSpriteFilename);

          megas.push({
            variant: getMegaVariant(megaPokemon.name),
            name: megaPokemon.name,
            displayName: formatDisplayName(megaPokemon.name),
            types: megaPokemon.types.map(t => t.type.name),
            sprite: `/sprites/${megaSpriteFilename}`,
          });
        }
      }
    }

    const result: Pokemon = {
      id: pokemon.id,
      name: pokemon.name,
      displayName: formatDisplayName(pokemon.name),
      types: pokemon.types.map(t => t.type.name),
      sprite: `/sprites/${spriteFilename}`,
    };

    if (megas.length > 0) {
      result.megas = megas;
    }

    return result;
  } catch (error) {
    console.error(`  Error fetching pokemon data: ${error}`);
    return null;
  }
}

async function main() {
  console.log('Pokemon Data Fetch Script');
  console.log('=========================\n');
  console.log(`Fetching from Pokedex IDs: ${POKEDEX_IDS.join(', ')}\n`);

  // Ensure directories exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SPRITES_DIR)) {
    fs.mkdirSync(SPRITES_DIR, { recursive: true });
  }

  // Collect all unique Pokemon entries from all Pokedexes
  const allEntries = new Map<string, PokedexEntry>();

  for (const pokedexId of POKEDEX_IDS) {
    console.log(`Fetching Pokedex #${pokedexId}...`);
    try {
      const pokedex = await fetchJson<PokeAPIPokedex>(`${POKEAPI_BASE}/pokedex/${pokedexId}`);
      console.log(`  Found ${pokedex.pokemon_entries.length} entries in "${pokedex.name}"`);

      for (const entry of pokedex.pokemon_entries) {
        // Use name as key to deduplicate
        if (!allEntries.has(entry.pokemon_species.name)) {
          allEntries.set(entry.pokemon_species.name, {
            name: entry.pokemon_species.name,
            url: entry.pokemon_species.url,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch Pokedex #${pokedexId}: ${error}`);
      console.error('Continuing with other Pokedexes...\n');
    }
  }

  const entries = Array.from(allEntries.values());
  console.log(`\nTotal unique Pokemon: ${entries.length}\n`);

  if (entries.length === 0) {
    console.error('No Pokemon found in any Pokedex. Exiting.');
    process.exit(1);
  }

  // Fetch each Pokemon
  const pokemon: Pokemon[] = [];
  const megaEvolutions: Record<string, MegaEvolution[]> = {};

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const progress = `[${i + 1}/${entries.length}]`;
    console.log(`${progress} Fetching ${entry.name}...`);

    const data = await fetchPokemonData(entry.url);
    if (data) {
      // Extract megas for separate file
      if (data.megas && data.megas.length > 0) {
        megaEvolutions[data.name] = data.megas;
        console.log(`  Found ${data.megas.length} mega evolution(s)`);
      }

      // Remove megas from main pokemon data (stored separately)
      const { megas: _, ...pokemonWithoutMegas } = data;
      pokemon.push(pokemonWithoutMegas as Pokemon);
    }

    // Rate limiting - be nice to PokeAPI
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Sort by ID
  pokemon.sort((a, b) => a.id - b.id);

  // Write pokemon.json
  const pokemonPath = path.join(DATA_DIR, 'pokemon.json');
  fs.writeFileSync(pokemonPath, JSON.stringify({ pokemon }, null, 2));
  console.log(`\nWrote ${pokemon.length} Pokemon to ${pokemonPath}`);

  // Write megas.json
  const megasPath = path.join(DATA_DIR, 'megas.json');
  fs.writeFileSync(megasPath, JSON.stringify({ megaEvolutions }, null, 2));
  console.log(`Wrote ${Object.keys(megaEvolutions).length} mega evolutions to ${megasPath}`);

  console.log('\nDone!');
}

main().catch(console.error);
