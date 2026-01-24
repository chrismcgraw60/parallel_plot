/**
 * Mythical Creature Data
 */

import type { Creature } from './types';

const SPECIES_LIST: Creature['species'][] = ['dragon', 'unicorn', 'phoenix', 'griffin', 'kraken', 'fairy'];

function randomInRange(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

function randomSpecies(): Creature['species'] {
  const index = Math.floor(Math.random() * SPECIES_LIST.length);
  return SPECIES_LIST[index] ?? 'dragon';
}

export function generateCreature(id: number): Creature {
  const species = randomSpecies();
  return {
    id: `creature-${id}`,
    label: `${species.charAt(0).toUpperCase() + species.slice(1)} ${id}`,
    species,
    values: {
      magic: randomInRange(10, 100),
      ferocity: randomInRange(10, 100),
      speed: randomInRange(10, 100),
      rarity: randomInRange(10, 100),
    },
    color: getSpeciesColor(species),
  };
}

function getSpeciesColor(species: Creature['species']): string {
  const colors: Record<Creature['species'], string> = {
    dragon: '#dc2626',    // red
    unicorn: '#c084fc',   // purple/pink
    phoenix: '#f97316',   // orange
    griffin: '#a16207',   // gold/brown
    kraken: '#0891b2',    // teal
    fairy: '#4ade80',     // green
  };
  return colors[species];
}

export function generateCreatures(count: number): Creature[] {
  return Array.from({ length: count }, (_, i) => generateCreature(i + 1));
}

export const SAMPLE_CREATURES: Creature[] = [
  // Dragons - high ferocity, varied magic
  { id: 'creature-1', label: 'Inferno Drake', species: 'dragon', values: { magic: 75, ferocity: 95, speed: 70, rarity: 60 }, color: '#dc2626' },
  { id: 'creature-2', label: 'Frost Wyrm', species: 'dragon', values: { magic: 88, ferocity: 80, speed: 55, rarity: 75 }, color: '#dc2626' },
  { id: 'creature-3', label: 'Shadow Dragon', species: 'dragon', values: { magic: 92, ferocity: 85, speed: 65, rarity: 90 }, color: '#dc2626' },

  // Unicorns - high magic, low ferocity
  { id: 'creature-4', label: 'Starlight', species: 'unicorn', values: { magic: 95, ferocity: 15, speed: 85, rarity: 80 }, color: '#c084fc' },
  { id: 'creature-5', label: 'Moonbeam', species: 'unicorn', values: { magic: 90, ferocity: 20, speed: 90, rarity: 70 }, color: '#c084fc' },
  { id: 'creature-6', label: 'Crystal Horn', species: 'unicorn', values: { magic: 85, ferocity: 10, speed: 75, rarity: 95 }, color: '#c084fc' },

  // Phoenixes - balanced, high rarity
  { id: 'creature-7', label: 'Ember', species: 'phoenix', values: { magic: 80, ferocity: 50, speed: 95, rarity: 85 }, color: '#f97316' },
  { id: 'creature-8', label: 'Solaris', species: 'phoenix', values: { magic: 85, ferocity: 45, speed: 88, rarity: 92 }, color: '#f97316' },

  // Griffins - balanced fighters
  { id: 'creature-9', label: 'Goldwing', species: 'griffin', values: { magic: 40, ferocity: 75, speed: 85, rarity: 55 }, color: '#a16207' },
  { id: 'creature-10', label: 'Stormbeak', species: 'griffin', values: { magic: 35, ferocity: 80, speed: 90, rarity: 50 }, color: '#a16207' },
  { id: 'creature-11', label: 'Irontalon', species: 'griffin', values: { magic: 30, ferocity: 88, speed: 78, rarity: 45 }, color: '#a16207' },

  // Krakens - slow but powerful
  { id: 'creature-12', label: 'Abyssal Terror', species: 'kraken', values: { magic: 60, ferocity: 98, speed: 25, rarity: 88 }, color: '#0891b2' },
  { id: 'creature-13', label: 'Deep One', species: 'kraken', values: { magic: 55, ferocity: 92, speed: 20, rarity: 82 }, color: '#0891b2' },

  // Fairies - high magic, low ferocity, fast
  { id: 'creature-14', label: 'Dewdrop', species: 'fairy', values: { magic: 70, ferocity: 5, speed: 95, rarity: 35 }, color: '#4ade80' },
  { id: 'creature-15', label: 'Shimmer', species: 'fairy', values: { magic: 75, ferocity: 8, speed: 92, rarity: 40 }, color: '#4ade80' },
  { id: 'creature-16', label: 'Whisper', species: 'fairy', values: { magic: 68, ferocity: 3, speed: 98, rarity: 30 }, color: '#4ade80' },

  // Legendary variants
  { id: 'creature-17', label: 'Ancient One', species: 'dragon', values: { magic: 98, ferocity: 90, speed: 40, rarity: 99 }, color: '#dc2626' },
  { id: 'creature-18', label: 'The Last Unicorn', species: 'unicorn', values: { magic: 100, ferocity: 25, speed: 80, rarity: 100 }, color: '#c084fc' },
];
