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
      value2: randomInRange(0, 100),
      value3: randomInRange(0, 100),
      value4: randomInRange(0, 100),
      value5: randomInRange(0, 100),
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
 * Pre-generated sample data for consistent testing.
 */
export const SAMPLE_ROBOTS: Robot[] = [
  { id: 'robot-1', label: 'Robot 1', values: { value2: 85, value3: 72, value4: 91, value5: 68 }, color: '#ef4444' },
  { id: 'robot-2', label: 'Robot 2', values: { value2: 45, value3: 88, value4: 33, value5: 77 }, color: '#f97316' },
  { id: 'robot-3', label: 'Robot 3', values: { value2: 92, value3: 65, value4: 78, value5: 84 }, color: '#eab308' },
  { id: 'robot-4', label: 'Robot 4', values: { value2: 28, value3: 41, value4: 56, value5: 39 }, color: '#22c55e' },
  { id: 'robot-5', label: 'Robot 5', values: { value2: 71, value3: 93, value4: 82, value5: 95 }, color: '#06b6d4' },
  { id: 'robot-6', label: 'Robot 6', values: { value2: 63, value3: 37, value4: 69, value5: 52 }, color: '#3b82f6' },
  { id: 'robot-7', label: 'Robot 7', values: { value2: 89, value3: 76, value4: 94, value5: 87 }, color: '#8b5cf6' },
  { id: 'robot-8', label: 'Robot 8', values: { value2: 34, value3: 58, value4: 21, value5: 46 }, color: '#ec4899' },
  { id: 'robot-9', label: 'Robot 9', values: { value2: 77, value3: 84, value4: 66, value5: 73 }, color: '#6366f1' },
  { id: 'robot-10', label: 'Robot 10', values: { value2: 51, value3: 29, value4: 87, value5: 62 }, color: '#14b8a6' },
  { id: 'robot-11', label: 'Robot 11', values: { value2: 96, value3: 91, value4: 88, value5: 93 }, color: '#ef4444' },
  { id: 'robot-12', label: 'Robot 12', values: { value2: 42, value3: 67, value4: 54, value5: 81 }, color: '#f97316' },
  { id: 'robot-13', label: 'Robot 13', values: { value2: 18, value3: 23, value4: 31, value5: 27 }, color: '#eab308' },
  { id: 'robot-14', label: 'Robot 14', values: { value2: 83, value3: 79, value4: 71, value5: 86 }, color: '#22c55e' },
  { id: 'robot-15', label: 'Robot 15', values: { value2: 59, value3: 44, value4: 92, value5: 38 }, color: '#06b6d4' },
  { id: 'robot-16', label: 'Robot 16', values: { value2: 74, value3: 96, value4: 63, value5: 79 }, color: '#3b82f6' },
  { id: 'robot-17', label: 'Robot 17', values: { value2: 31, value3: 52, value4: 47, value5: 55 }, color: '#8b5cf6' },
  { id: 'robot-18', label: 'Robot 18', values: { value2: 67, value3: 81, value4: 76, value5: 69 }, color: '#ec4899' },
  { id: 'robot-19', label: 'Robot 19', values: { value2: 88, value3: 34, value4: 99, value5: 91 }, color: '#6366f1' },
  { id: 'robot-20', label: 'Robot 20', values: { value2: 23, value3: 69, value4: 42, value5: 33 }, color: '#14b8a6' },
];
