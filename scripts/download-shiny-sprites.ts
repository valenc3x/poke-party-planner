/**
 * Download shiny sprites from PokeOS for all Pokemon
 * Uses the existing JSON data to determine which sprites are needed
 */

import * as fs from "fs";
import * as path from "path";

const POKEOS_SHINY_SPRITE_BASE = "https://s3.pokeos.com/pokeos-uploads/assets/pokemon/home/render/shiny";
const DATA_DIR = path.join(process.cwd(), "src/data");
const SHINY_SPRITES_DIR = path.join(process.cwd(), "public/sprites/shiny");

interface Pokemon {
  id: number;
  name: string;
  shinySprite: string;
}

interface MegaEvolution {
  variant: string | null;
  name: string;
  sprite: string;
  shinySprite: string;
}

async function downloadSprite(url: string, filepath: string): Promise<boolean> {
  // Skip if already downloaded
  if (fs.existsSync(filepath)) {
    return true;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  Warning: Could not download ${url}: HTTP ${response.status}`);
      return false;
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.warn(`  Warning: Failed to download ${url}: ${error}`);
    return false;
  }
}

async function main() {
  console.log("Downloading Shiny Sprites from PokeOS");
  console.log("=====================================\n");

  // Ensure shiny directory exists
  if (!fs.existsSync(SHINY_SPRITES_DIR)) {
    fs.mkdirSync(SHINY_SPRITES_DIR, { recursive: true });
  }

  // Read pokemon.json
  const pokemonPath = path.join(DATA_DIR, "pokemon.json");
  const pokemonData = JSON.parse(fs.readFileSync(pokemonPath, "utf-8")) as {
    pokemon: Pokemon[];
  };

  // Read megas.json
  const megasPath = path.join(DATA_DIR, "megas.json");
  const megasData = JSON.parse(fs.readFileSync(megasPath, "utf-8")) as {
    megaEvolutions: Record<string, MegaEvolution[]>;
  };

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  // Download base Pokemon shiny sprites
  console.log("Downloading base Pokemon shiny sprites...");
  for (const pokemon of pokemonData.pokemon) {
    const filename = `${pokemon.id}.png`;
    const url = `${POKEOS_SHINY_SPRITE_BASE}/${filename}`;
    const filepath = path.join(SHINY_SPRITES_DIR, filename);

    if (fs.existsSync(filepath)) {
      skipped++;
      continue;
    }

    const success = await downloadSprite(url, filepath);
    if (success) {
      downloaded++;
      if (downloaded % 50 === 0) {
        console.log(`  Downloaded ${downloaded} sprites...`);
      }
    } else {
      failed++;
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log(`\nBase Pokemon: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);

  // Download mega shiny sprites
  console.log("\nDownloading mega evolution shiny sprites...");
  let megaDownloaded = 0;
  let megaSkipped = 0;
  let megaFailed = 0;

  for (const megas of Object.values(megasData.megaEvolutions)) {
    for (const mega of megas) {
      // Extract filename from the shinySprite path
      const filename = mega.shinySprite.replace("/sprites/shiny/", "");
      const url = `${POKEOS_SHINY_SPRITE_BASE}/${filename}`;
      const filepath = path.join(SHINY_SPRITES_DIR, filename);

      if (fs.existsSync(filepath)) {
        megaSkipped++;
        continue;
      }

      const success = await downloadSprite(url, filepath);
      if (success) {
        megaDownloaded++;
        console.log(`  Downloaded: ${mega.name}`);
      } else {
        megaFailed++;
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  console.log(`Mega evolutions: ${megaDownloaded} downloaded, ${megaSkipped} skipped, ${megaFailed} failed`);

  console.log("\n=====================================");
  console.log(`Total: ${downloaded + megaDownloaded} new sprites downloaded`);
  console.log("Done!");
}

main().catch(console.error);
