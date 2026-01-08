# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Poke Party Planner - A web application for building and analyzing Pokemon teams for Pokemon Legends Z-A. The app displays all available Pokemon from the game's Pokedex, allows users to select up to 6 Pokemon for their team, and provides type coverage analysis showing strengths and weaknesses.

### Core Features

- **Pokedex Browser**: Display all Pokemon available in Pokemon Legends Z-A with sprites, names, and type badges
- **Team Builder**: Select up to 6 Pokemon for your team
- **Mega Evolution Toggle**: Base Pokemon can be toggled to their Mega form when available
- **Type Coverage Analysis**: Show all type advantages and weaknesses for the selected team
- **Weakness Highlighting**: Visual warning when team has multiple Pokemon weak to the same type
- **Weakness Prevention**: Pokedex highlights Pokemon that would worsen existing team weaknesses (e.g., if 2+ Pokemon are weak to Fire, all Fire-weak Pokemon in the browser are marked)
- **Persistence**: Save teams to LocalStorage + shareable URLs with encoded team state
- **Offline-First**: All Pokemon data bundled with the app (no runtime API calls)

### Design Decisions

- **No Abilities**: Pokemon Legends Z-A doesn't use traditional abilities, so type-only analysis
- **Mega Forms**: Displayed as toggles on base Pokemon, not separate entries
- **Data Source**: PokeAPI's `/pokedex` endpoint for the Z-A Pokedex, fetched at build time

## Tech Stack

- **Language**: TypeScript
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Data Source**: PokeAPI (build-time only)

## Project Structure

```
poke-party-planner/
├── public/
│   └── sprites/              # Pokemon sprite images (downloaded at build)
├── scripts/
│   └── fetch-pokemon-data.ts # Script to fetch data from PokeAPI
├── src/
│   ├── components/
│   │   ├── PokedexGrid.tsx       # Grid of all available Pokemon (with weakness warnings)
│   │   ├── PokemonCard.tsx       # Individual Pokemon display
│   │   ├── TeamBuilder.tsx       # Selected team slots (6 max)
│   │   ├── TeamSlot.tsx          # Single team slot with Mega toggle
│   │   ├── TypeBadge.tsx         # Type indicator badge
│   │   ├── TypeCoverage.tsx      # Type advantages/weaknesses display
│   │   └── WeaknessChart.tsx     # Team weakness summary with warnings
│   ├── data/
│   │   ├── pokemon.json          # Generated Pokemon data
│   │   ├── types.json            # Type effectiveness chart
│   │   └── megas.json            # Mega evolution mappings
│   ├── hooks/
│   │   ├── useTeam.ts            # Team state management
│   │   ├── useTypeCoverage.ts    # Type calculation logic
│   │   └── usePersistedState.ts  # LocalStorage + URL sync
│   ├── types/
│   │   └── pokemon.ts            # TypeScript interfaces
│   ├── utils/
│   │   ├── typeChart.ts          # Type effectiveness calculations
│   │   └── urlState.ts           # URL encoding/decoding for sharing
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                 # Tailwind imports
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── vitest.config.ts
```

## Data Model

### Pokemon
```typescript
interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  sprite: string;
  mega?: MegaEvolution;
}

interface MegaEvolution {
  name: string;
  displayName: string;
  types: PokemonType[];
  sprite: string;
}

type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';
```

### Team Slot
```typescript
interface TeamSlot {
  pokemon: Pokemon;
  isMega: boolean;  // Whether Mega form is active (if available)
}
```

## Implementation Plan

### Phase 1: Project Setup ✅
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS
- [x] Set up Vitest
- [x] Configure ESLint
- [x] Create basic folder structure

### Phase 2: Data Pipeline ✅
- [x] Create fetch script for PokeAPI
- [x] Fetch Pokemon Legends Z-A Pokedex (IDs 34 + 35)
- [x] Fetch individual Pokemon data (types, sprites)
- [x] Identify and map Mega evolutions (48 found)
- [x] Download sprite images to public folder
- [x] Generate static JSON files (364 Pokemon)

### Phase 3: Core Components
- [ ] Build type effectiveness chart utility
- [ ] Create TypeBadge component with type colors
- [ ] Create PokemonCard component
- [ ] Create PokedexGrid with search/filter
- [ ] Create TeamSlot with Mega toggle
- [ ] Create TeamBuilder (6 slots)

### Phase 4: Type Analysis
- [ ] Implement type coverage calculation
- [ ] Create TypeCoverage display component
- [ ] Create WeaknessChart with stacked weaknesses
- [ ] Add visual warning for repeated weaknesses (color highlight)
- [ ] Add weakness prevention highlights in PokedexGrid (mark Pokemon that would worsen 2+ stacked weaknesses)

### Phase 5: Persistence & Sharing
- [ ] Implement LocalStorage persistence
- [ ] Implement URL state encoding/decoding
- [ ] Add share button with copy-to-clipboard
- [ ] Handle URL parsing on page load

### Phase 6: Polish
- [ ] Responsive design (mobile-friendly)
- [ ] Add loading states
- [ ] Add empty states
- [ ] Accessibility improvements
- [ ] Performance optimization (virtualization if needed)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Fetch Pokemon data from PokeAPI
npm run fetch-data

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Type Effectiveness Reference

The type chart follows standard Pokemon type matchups:
- **Super Effective (2x)**: Attacking type deals double damage
- **Not Very Effective (0.5x)**: Attacking type deals half damage
- **No Effect (0x)**: Attacking type deals no damage (Ghost/Normal, etc.)
- **Dual Types**: Multiply effectiveness (can result in 4x, 0.25x, or 0x)

## Notes

- Pokedex ID for Pokemon Legends Z-A: 34
- Mega evolutions change types in some cases (e.g., Mega Charizard X gains Dragon)
- Team weakness threshold for highlighting: 3+ Pokemon weak to same type (configurable)
- Weakness prevention threshold: 2+ Pokemon weak to same type triggers Pokedex warnings
