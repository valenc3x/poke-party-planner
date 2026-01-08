/**
 * Fix shinySprite paths for megas that don't have actual shiny sprites
 * Falls back to regular sprite when shiny sprite file doesn't exist
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const SHINY_SPRITES_DIR = path.join(process.cwd(), "public/sprites/shiny");

interface MegaEvolution {
  variant: string | null;
  name: string;
  displayName: string;
  types: string[];
  sprite: string;
  shinySprite: string;
}

// Read megas.json
const megasPath = path.join(DATA_DIR, "megas.json");
const megasData = JSON.parse(fs.readFileSync(megasPath, "utf-8")) as {
  megaEvolutions: Record<string, MegaEvolution[]>;
};

let fixedCount = 0;

for (const megas of Object.values(megasData.megaEvolutions)) {
  for (const mega of megas) {
    // Check if the shiny sprite file exists
    const shinyFilename = mega.shinySprite.replace("/sprites/shiny/", "");
    const shinyPath = path.join(SHINY_SPRITES_DIR, shinyFilename);

    if (!fs.existsSync(shinyPath)) {
      // Fall back to regular sprite
      console.log(`  ${mega.name}: falling back to regular sprite`);
      mega.shinySprite = mega.sprite;
      fixedCount++;
    }
  }
}

// Write updated megas.json
fs.writeFileSync(megasPath, JSON.stringify(megasData, null, 2));
console.log(`\nFixed ${fixedCount} mega evolutions with missing shiny sprites`);
