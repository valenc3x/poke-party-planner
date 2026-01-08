import { describe, it, expect } from 'vitest';
import { encodeTeamToUrl, decodeTeamFromUrl } from './urlState';
import type { Team, Pokemon } from '../types/pokemon';

const mockPokemon: Pokemon[] = [
  {
    id: 25,
    name: 'pikachu',
    displayName: 'Pikachu',
    types: ['electric'],
    sprite: '/sprites/25.png',
  },
  {
    id: 6,
    name: 'charizard',
    displayName: 'Charizard',
    types: ['fire', 'flying'],
    sprite: '/sprites/6.png',
    megas: [
      {
        variant: 'x',
        name: 'charizard-mega-x',
        displayName: 'Mega Charizard X',
        types: ['fire', 'dragon'],
        sprite: '/sprites/6-mega-x.png',
      },
      {
        variant: 'y',
        name: 'charizard-mega-y',
        displayName: 'Mega Charizard Y',
        types: ['fire', 'flying'],
        sprite: '/sprites/6-mega-y.png',
      },
    ],
  },
  {
    id: 9,
    name: 'blastoise',
    displayName: 'Blastoise',
    types: ['water'],
    sprite: '/sprites/9.png',
    megas: [
      {
        variant: null,
        name: 'blastoise-mega',
        displayName: 'Mega Blastoise',
        types: ['water'],
        sprite: '/sprites/9-mega.png',
      },
    ],
  },
];

const pokemonLookup = new Map<number, Pokemon>(
  mockPokemon.map((p) => [p.id, p])
);

describe('urlState', () => {
  describe('encodeTeamToUrl', () => {
    it('encodes an empty team', () => {
      const team: Team = [null, null, null, null, null, null];
      expect(encodeTeamToUrl(team)).toBe('0-0-0-0-0-0');
    });

    it('encodes a team with one pokemon', () => {
      const team: Team = [
        { pokemon: mockPokemon[0], isMega: false, megaIndex: 0 },
        null,
        null,
        null,
        null,
        null,
      ];
      expect(encodeTeamToUrl(team)).toBe('25.0.0-0-0-0-0-0');
    });

    it('encodes a team with mega pokemon', () => {
      const team: Team = [
        { pokemon: mockPokemon[1], isMega: true, megaIndex: 0 },
        null,
        null,
        null,
        null,
        null,
      ];
      expect(encodeTeamToUrl(team)).toBe('6.1.0-0-0-0-0-0');
    });

    it('encodes a team with mega variant Y', () => {
      const team: Team = [
        { pokemon: mockPokemon[1], isMega: true, megaIndex: 1 },
        null,
        null,
        null,
        null,
        null,
      ];
      expect(encodeTeamToUrl(team)).toBe('6.1.1-0-0-0-0-0');
    });

    it('encodes a full team', () => {
      const team: Team = [
        { pokemon: mockPokemon[0], isMega: false, megaIndex: 0 },
        { pokemon: mockPokemon[1], isMega: true, megaIndex: 0 },
        { pokemon: mockPokemon[2], isMega: false, megaIndex: 0 },
        null,
        null,
        null,
      ];
      expect(encodeTeamToUrl(team)).toBe('25.0.0-6.1.0-9.0.0-0-0-0');
    });
  });

  describe('decodeTeamFromUrl', () => {
    it('decodes an empty team', () => {
      const team = decodeTeamFromUrl('0-0-0-0-0-0', pokemonLookup);
      expect(team.every((slot) => slot === null)).toBe(true);
    });

    it('decodes a team with one pokemon', () => {
      const team = decodeTeamFromUrl('25.0.0-0-0-0-0-0', pokemonLookup);
      expect(team[0]?.pokemon.id).toBe(25);
      expect(team[0]?.isMega).toBe(false);
      expect(team.slice(1).every((slot) => slot === null)).toBe(true);
    });

    it('decodes a team with mega pokemon', () => {
      const team = decodeTeamFromUrl('6.1.0-0-0-0-0-0', pokemonLookup);
      expect(team[0]?.pokemon.id).toBe(6);
      expect(team[0]?.isMega).toBe(true);
      expect(team[0]?.megaIndex).toBe(0);
    });

    it('decodes a team with mega variant Y', () => {
      const team = decodeTeamFromUrl('6.1.1-0-0-0-0-0', pokemonLookup);
      expect(team[0]?.pokemon.id).toBe(6);
      expect(team[0]?.isMega).toBe(true);
      expect(team[0]?.megaIndex).toBe(1);
    });

    it('handles invalid pokemon IDs gracefully', () => {
      const team = decodeTeamFromUrl('999.0.0-0-0-0-0-0', pokemonLookup);
      expect(team[0]).toBe(null);
    });

    it('ignores mega flag for pokemon without megas', () => {
      const team = decodeTeamFromUrl('25.1.0-0-0-0-0-0', pokemonLookup);
      expect(team[0]?.pokemon.id).toBe(25);
      expect(team[0]?.isMega).toBe(false); // Pikachu has no mega
    });

    it('handles invalid encoded strings gracefully', () => {
      const team = decodeTeamFromUrl('invalid-data', pokemonLookup);
      expect(team.every((slot) => slot === null)).toBe(true);
    });
  });

  describe('roundtrip', () => {
    it('encodes and decodes back to the same team', () => {
      const originalTeam: Team = [
        { pokemon: mockPokemon[0], isMega: false, megaIndex: 0 },
        { pokemon: mockPokemon[1], isMega: true, megaIndex: 1 },
        { pokemon: mockPokemon[2], isMega: true, megaIndex: 0 },
        null,
        null,
        null,
      ];

      const encoded = encodeTeamToUrl(originalTeam);
      const decoded = decodeTeamFromUrl(encoded, pokemonLookup);

      expect(decoded[0]?.pokemon.id).toBe(originalTeam[0]?.pokemon.id);
      expect(decoded[0]?.isMega).toBe(originalTeam[0]?.isMega);
      expect(decoded[1]?.pokemon.id).toBe(originalTeam[1]?.pokemon.id);
      expect(decoded[1]?.isMega).toBe(originalTeam[1]?.isMega);
      expect(decoded[1]?.megaIndex).toBe(originalTeam[1]?.megaIndex);
      expect(decoded[2]?.pokemon.id).toBe(originalTeam[2]?.pokemon.id);
      expect(decoded[2]?.isMega).toBe(originalTeam[2]?.isMega);
    });
  });
});
