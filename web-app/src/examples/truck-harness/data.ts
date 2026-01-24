/**
 * Truck Demo Data
 */

import type { Truck } from './types';

const TRUCK_COLORS = [
  '#1e40af', // blue
  '#991b1b', // dark red
  '#166534', // dark green
  '#92400e', // brown
  '#4c1d95', // purple
  '#0f766e', // teal
  '#c2410c', // orange
  '#475569', // slate
];

function randomInRange(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

export function generateTruck(id: number): Truck {
  return {
    id: `truck-${id}`,
    label: `Truck ${id}`,
    values: {
      horsepower: randomInRange(150, 500),
      capacity: randomInRange(5, 50),
      efficiency: randomInRange(5, 28),
      reliability: randomInRange(20, 100),
    },
    color: TRUCK_COLORS[id % TRUCK_COLORS.length],
  };
}

export function generateTrucks(count: number): Truck[] {
  return Array.from({ length: count }, (_, i) => generateTruck(i + 1));
}

export const SAMPLE_TRUCKS: Truck[] = [
  // Heavy haulers - high capacity, low efficiency
  { id: 'truck-1', label: 'Big Rig Alpha', values: { horsepower: 450, capacity: 45, efficiency: 8, reliability: 75 }, color: '#1e40af' },
  { id: 'truck-2', label: 'Titan Hauler', values: { horsepower: 480, capacity: 48, efficiency: 6, reliability: 70 }, color: '#991b1b' },

  // Efficient runners - balanced
  { id: 'truck-3', label: 'EcoFleet 3000', values: { horsepower: 280, capacity: 25, efficiency: 22, reliability: 88 }, color: '#166534' },
  { id: 'truck-4', label: 'GreenMile', values: { horsepower: 250, capacity: 20, efficiency: 25, reliability: 92 }, color: '#0f766e' },

  // Workhorses - high reliability
  { id: 'truck-5', label: 'Reliable Rex', values: { horsepower: 320, capacity: 30, efficiency: 15, reliability: 95 }, color: '#92400e' },
  { id: 'truck-6', label: 'Iron Horse', values: { horsepower: 350, capacity: 32, efficiency: 14, reliability: 98 }, color: '#475569' },

  // Speed demons - high horsepower
  { id: 'truck-7', label: 'Thunder Road', values: { horsepower: 500, capacity: 20, efficiency: 10, reliability: 65 }, color: '#4c1d95' },
  { id: 'truck-8', label: 'Blitz Runner', values: { horsepower: 480, capacity: 18, efficiency: 12, reliability: 60 }, color: '#c2410c' },

  // Budget options - lower stats
  { id: 'truck-9', label: 'Bargain Buster', values: { horsepower: 200, capacity: 15, efficiency: 18, reliability: 55 }, color: '#1e40af' },
  { id: 'truck-10', label: 'Starter Special', values: { horsepower: 180, capacity: 12, efficiency: 20, reliability: 50 }, color: '#991b1b' },

  // Premium all-rounders
  { id: 'truck-11', label: 'Executive XL', values: { horsepower: 400, capacity: 35, efficiency: 16, reliability: 90 }, color: '#166534' },
  { id: 'truck-12', label: 'Fleet Master', values: { horsepower: 380, capacity: 38, efficiency: 14, reliability: 85 }, color: '#92400e' },

  // Specialty trucks
  { id: 'truck-13', label: 'City Sprinter', values: { horsepower: 220, capacity: 10, efficiency: 28, reliability: 82 }, color: '#4c1d95' },
  { id: 'truck-14', label: 'Mountain King', values: { horsepower: 420, capacity: 28, efficiency: 11, reliability: 78 }, color: '#0f766e' },
  { id: 'truck-15', label: 'Desert Runner', values: { horsepower: 360, capacity: 22, efficiency: 13, reliability: 72 }, color: '#c2410c' },
];
