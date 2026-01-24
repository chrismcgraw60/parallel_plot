/**
 * Robot Demo Data Generator
 *
 * Generates sample robot data for testing the parallel plot.
 */

import type { Robot } from './types';

/**
 * Color palette for robots.
 */
const ROBOT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
];

/**
 * Generates a random number in range [min, max].
 */
function randomInRange(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

/**
 * Generates a single robot with random attribute values.
 *
 * @param id - Robot number
 * @returns Robot domain object
 */
export function generateRobot(id: number): Robot {
  return {
    id: `robot-${id}`,
    label: `Robot ${id}`,
    values: {
      speed: randomInRange(0, 100),
      strength: randomInRange(0, 100),
      intelligence: randomInRange(0, 100),
      battery: randomInRange(0, 100),
    },
    color: ROBOT_COLORS[id % ROBOT_COLORS.length],
  };
}

/**
 * Generates an array of robots with random attribute values.
 *
 * @param count - Number of robots to generate
 * @returns Array of robot domain objects
 */
export function generateRobots(count: number): Robot[] {
  return Array.from({ length: count }, (_, i) => generateRobot(i + 1));
}

/**
 * Pre-generated sample data with varied attribute distributions.
 * Mix of specialists (high in one area) and generalists (balanced).
 */
export const SAMPLE_ROBOTS: Robot[] = [
  // Speedsters - high speed, lower other stats
  { id: 'robot-1', label: 'Robot 1', values: { speed: 95, strength: 30, intelligence: 45, battery: 60 }, color: '#ef4444' },
  { id: 'robot-2', label: 'Robot 2', values: { speed: 88, strength: 25, intelligence: 50, battery: 55 }, color: '#f97316' },

  // Tanks - high strength, slower
  { id: 'robot-3', label: 'Robot 3', values: { speed: 25, strength: 92, intelligence: 40, battery: 70 }, color: '#eab308' },
  { id: 'robot-4', label: 'Robot 4', values: { speed: 30, strength: 85, intelligence: 35, battery: 80 }, color: '#22c55e' },

  // Brainiacs - high intelligence
  { id: 'robot-5', label: 'Robot 5', values: { speed: 40, strength: 35, intelligence: 95, battery: 50 }, color: '#06b6d4' },
  { id: 'robot-6', label: 'Robot 6', values: { speed: 45, strength: 40, intelligence: 90, battery: 45 }, color: '#3b82f6' },

  // Endurance - high battery
  { id: 'robot-7', label: 'Robot 7', values: { speed: 55, strength: 50, intelligence: 55, battery: 95 }, color: '#8b5cf6' },
  { id: 'robot-8', label: 'Robot 8', values: { speed: 50, strength: 45, intelligence: 60, battery: 90 }, color: '#ec4899' },

  // All-rounders - balanced stats
  { id: 'robot-9', label: 'Robot 9', values: { speed: 65, strength: 70, intelligence: 68, battery: 72 }, color: '#6366f1' },
  { id: 'robot-10', label: 'Robot 10', values: { speed: 70, strength: 65, intelligence: 72, battery: 68 }, color: '#14b8a6' },

  // Elite - high across the board
  { id: 'robot-11', label: 'Robot 11', values: { speed: 85, strength: 80, intelligence: 88, battery: 82 }, color: '#ef4444' },
  { id: 'robot-12', label: 'Robot 12', values: { speed: 82, strength: 85, intelligence: 80, battery: 88 }, color: '#f97316' },

  // Struggling - low stats (red zone)
  { id: 'robot-13', label: 'Robot 13', values: { speed: 20, strength: 25, intelligence: 22, battery: 28 }, color: '#eab308' },
  { id: 'robot-14', label: 'Robot 14', values: { speed: 15, strength: 18, intelligence: 28, battery: 20 }, color: '#22c55e' },

  // Mixed specialists
  { id: 'robot-15', label: 'Robot 15', values: { speed: 90, strength: 88, intelligence: 30, battery: 35 }, color: '#06b6d4' },
  { id: 'robot-16', label: 'Robot 16', values: { speed: 28, strength: 32, intelligence: 85, battery: 92 }, color: '#3b82f6' },

  // Average performers (amber zone)
  { id: 'robot-17', label: 'Robot 17', values: { speed: 45, strength: 50, intelligence: 48, battery: 52 }, color: '#8b5cf6' },
  { id: 'robot-18', label: 'Robot 18', values: { speed: 52, strength: 48, intelligence: 55, battery: 45 }, color: '#ec4899' },

  // More variety
  { id: 'robot-19', label: 'Robot 19', values: { speed: 75, strength: 60, intelligence: 85, battery: 40 }, color: '#6366f1' },
  { id: 'robot-20', label: 'Robot 20', values: { speed: 35, strength: 78, intelligence: 42, battery: 88 }, color: '#14b8a6' },
];
