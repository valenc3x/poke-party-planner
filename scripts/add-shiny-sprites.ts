/**
 * Add shinySprite fields to existing pokemon.json and megas.json
 * This avoids re-fetching all data from PokeAPI
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");

interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  types: string[];
  sprite: string;
  shinySprite?: string;
  isFinalEvolution: boolean;
}

interface MegaEvolution {
  variant: string | null;
  name: string;
  displayName: string;
  types: string[];
  sprite: string;
  shinySprite?: string;
}

// Read pokemon.json
const pokemonPath = path.join(DATA_DIR, "pokemon.json");
const pokemonData = JSON.parse(fs.readFileSync(pokemonPath, "utf-8")) as {
  pokemon: Pokemon[];
};

// Add shinySprite to each Pokemon
for (const p of pokemonData.pokemon) {
  p.shinySprite = `/sprites/shiny/${p.id}.png`;
}

// Write updated pokemon.json
fs.writeFileSync(pokemonPath, JSON.stringify(pokemonData, null, 2));
console.log(`Updated ${pokemonData.pokemon.length} Pokemon with shinySprite`);

// Read megas.json
const megasPath = path.join(DATA_DIR, "megas.json");
const megasData = JSON.parse(fs.readFileSync(megasPath, "utf-8")) as {
  megaEvolutions: Record<string, MegaEvolution[]>;
};

// Add shinySprite to each mega
let megaCount = 0;
for (const megas of Object.values(megasData.megaEvolutions)) {
  for (const mega of megas) {
    // Extract sprite filename pattern from existing sprite path
    const spriteFilename = mega.sprite.replace("/sprites/", "");
    mega.shinySprite = `/sprites/shiny/${spriteFilename}`;
    megaCount++;
  }
}

// Write updated megas.json
fs.writeFileSync(megasPath, JSON.stringify(megasData, null, 2));
console.log(`Updated ${megaCount} Mega evolutions with shinySprite`);

console.log("\nDone!");
