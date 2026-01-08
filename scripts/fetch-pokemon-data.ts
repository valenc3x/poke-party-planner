/**
 * Fetch Pokemon data from PokeAPI for Pokemon Legends Z-A
 *
 * This script fetches Pokemon data from the PokeAPI and generates:
 * - src/data/pokemon.json - All Pokemon in the Pokedex
 * - src/data/megas.json - Mega evolution mappings
 * - public/sprites/*.png - Pokemon sprite images (from PokeOS)
 *
 * Sprites: Uses PokeOS Home renders for consistent, high-quality images.
 * If a sprite is unavailable, megas will fall back to /sprites/default-mega.png.
 *
 * Usage: npm run fetch-data
 */

import * as fs from "fs";
import * as path from "path";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const POKEOS_SPRITE_BASE = "https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/render";

// Pokemon Legends Z-A uses two Pokedex IDs
const POKEDEX_IDS = [34, 35];

// Output paths
const DATA_DIR = path.join(process.cwd(), "src/data");
const SPRITES_DIR = path.join(process.cwd(), "public/sprites");

// Default placeholder sprite path (user should provide this file)
const DEFAULT_SPRITE = "/sprites/default-mega.png";

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
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
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

async function fetchJson<T>(url: string, retries = 3): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json() as Promise<T>;
    } catch (error) {
      if (attempt === retries - 1) {
        throw new Error(
          `Failed to fetch ${url} after ${retries} attempts: ${error}`,
        );
      }
      const delay = 1000 * (attempt + 1);
      console.warn(
        `  Retry ${attempt + 1}/${retries} for ${url} in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable");
}

async function downloadSprite(url: string, filename: string): Promise<boolean> {
  const filepath = path.join(SPRITES_DIR, filename);
  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    return true;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `  Warning: Could not download sprite from ${url}: HTTP ${response.status}`,
      );
      return false;
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.warn(`  Warning: Failed to download sprite from ${url}: ${error}`);
    return false;
  }
}

function getPokeOSSpriteUrl(pokemonId: number, megaVariant?: string | null): string {
  if (!megaVariant) {
    // Regular mega (no X/Y/Z variant)
    return `${POKEOS_SPRITE_BASE}/${pokemonId}-mega.png`;
  }
  // Mega with variant (X, Y, or Z)
  return `${POKEOS_SPRITE_BASE}/${pokemonId}-mega-${megaVariant}.png`;
}

function getPokeOSBaseSpriteUrl(pokemonId: number): string {
  return `${POKEOS_SPRITE_BASE}/${pokemonId}.png`;
}

function formatDisplayName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getEnglishName(species: PokeAPISpecies): string {
  const englishEntry = species.names.find((n) => n.language.name === "en");
  return englishEntry?.name || formatDisplayName(species.name);
}

function formatMegaDisplayName(
  baseDisplayName: string,
  megaName: string,
): string {
  if (megaName.includes("-mega-x")) return `Mega ${baseDisplayName} X`;
  if (megaName.includes("-mega-y")) return `Mega ${baseDisplayName} Y`;
  if (megaName.includes("-mega-z")) return `Mega ${baseDisplayName} Z`;
  return `Mega ${baseDisplayName}`;
}

function getMegaVariant(name: string): string | null {
  if (name.includes("-mega-x")) return "x";
  if (name.includes("-mega-y")) return "y";
  if (name.includes("-mega-z")) return "z";
  return null;
}

async function fetchPokemonData(speciesUrl: string): Promise<Pokemon | null> {
  try {
    const species = await fetchJson<PokeAPISpecies>(speciesUrl);

    // Get the proper English display name from species
    const displayName = getEnglishName(species);

    // Find the default variety (base form)
    const defaultVariety = species.varieties.find((v) => v.is_default);
    if (!defaultVariety) {
      console.warn(`  No default variety for ${species.name}`);
      return null;
    }

    const pokemon = await fetchJson<PokeAPIPokemon>(defaultVariety.pokemon.url);

    // Download base sprite from PokeOS
    const baseSpriteUrl = getPokeOSBaseSpriteUrl(pokemon.id);
    const spriteFilename = `${pokemon.id}.png`;
    const spriteDownloaded = await downloadSprite(baseSpriteUrl, spriteFilename);

    if (!spriteDownloaded) {
      console.warn(`  Skipping ${pokemon.name} - sprite download failed`);
      return null;
    }

    // Find mega evolutions
    const megas: MegaEvolution[] = [];
    for (const variety of species.varieties) {
      if (variety.pokemon.name.includes("-mega")) {
        console.log(`  -> Mega found: ${variety.pokemon.name}`);
        const megaPokemon = await fetchJson<PokeAPIPokemon>(
          variety.pokemon.url,
        );

        const megaVariant = getMegaVariant(megaPokemon.name);
        const megaSpriteUrl = getPokeOSSpriteUrl(pokemon.id, megaVariant);

        // Construct filename based on variant
        let megaSpriteFilename: string;
        if (megaVariant) {
          megaSpriteFilename = `${pokemon.id}-mega-${megaVariant}.png`;
        } else {
          megaSpriteFilename = `${pokemon.id}-mega.png`;
        }

        const megaSpriteDownloaded = await downloadSprite(
          megaSpriteUrl,
          megaSpriteFilename,
        );

        let megaSpritePath: string;
        if (megaSpriteDownloaded) {
          console.log(`     Sprite downloaded: ${megaSpriteFilename}`);
          megaSpritePath = `/sprites/${megaSpriteFilename}`;
        } else {
          console.log(`     Using default placeholder for ${megaPokemon.name}`);
          megaSpritePath = DEFAULT_SPRITE;
        }

        megas.push({
          variant: megaVariant,
          name: megaPokemon.name,
          displayName: formatMegaDisplayName(displayName, megaPokemon.name),
          types: megaPokemon.types.map((t) => t.type.name),
          sprite: megaSpritePath,
        });
      }
    }

    const result: Pokemon = {
      id: pokemon.id,
      name: pokemon.name,
      displayName,
      types: pokemon.types.map((t) => t.type.name),
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
  console.log("Pokemon Data Fetch Script");
  console.log("=========================\n");
  console.log(`Fetching from Pokedex IDs: ${POKEDEX_IDS.join(", ")}`);
  console.log(`Sprite source: PokeOS Home renders\n`);

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
      const pokedex = await fetchJson<PokeAPIPokedex>(
        `${POKEAPI_BASE}/pokedex/${pokedexId}`,
      );
      console.log(
        `  Found ${pokedex.pokemon_entries.length} entries in "${pokedex.name}"`,
      );

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
      console.error("Continuing with other Pokedexes...\n");
    }
  }

  const entries = Array.from(allEntries.values());
  console.log(`\nTotal unique Pokemon: ${entries.length}\n`);

  if (entries.length === 0) {
    console.error("No Pokemon found in any Pokedex. Exiting.");
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

    // Rate limiting - be nice to the APIs
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Sort by ID
  pokemon.sort((a, b) => a.id - b.id);

  // Write pokemon.json
  const pokemonPath = path.join(DATA_DIR, "pokemon.json");
  fs.writeFileSync(pokemonPath, JSON.stringify({ pokemon }, null, 2));
  console.log(`\nWrote ${pokemon.length} Pokemon to ${pokemonPath}`);

  // Write megas.json
  const megasPath = path.join(DATA_DIR, "megas.json");
  fs.writeFileSync(megasPath, JSON.stringify({ megaEvolutions }, null, 2));
  console.log(
    `Wrote ${Object.keys(megaEvolutions).length} mega evolutions to ${megasPath}`,
  );

  // Count how many megas are using the default placeholder
  let defaultCount = 0;
  for (const megas of Object.values(megaEvolutions)) {
    for (const mega of megas) {
      if (mega.sprite === DEFAULT_SPRITE) {
        defaultCount++;
      }
    }
  }

  if (defaultCount > 0) {
    console.log(`\nNote: ${defaultCount} mega(s) using default-mega.png placeholder`);
  }

  console.log("\nDone!");
}

main().catch(console.error);
