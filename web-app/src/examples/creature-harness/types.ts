/**
 * Mythical Creature Types
 */

import type { DomainObject, AxisConfig, AxisRanges, Range } from '../../components/parallel-plot/types';

export type CreatureAttributeKey = 'magic' | 'ferocity' | 'speed' | 'rarity';

export interface Creature extends DomainObject<CreatureAttributeKey> {
  label: string;
  species: 'dragon' | 'unicorn' | 'phoenix' | 'griffin' | 'kraken' | 'fairy';
}

export const CREATURE_AXES: AxisConfig[] = [
  { key: 'magic', label: 'Magic Power', min: 0, max: 100 },
  { key: 'ferocity', label: 'Ferocity', min: 0, max: 100 },
  { key: 'speed', label: 'Speed', min: 0, max: 100 },
  { key: 'rarity', label: 'Rarity', min: 0, max: 100 },
];

export const CREATURE_RANGES: Range[] = [
  { name: 'red', min: 0, max: 30, color: '#ef4444', opacity: 0.5 },
  { name: 'amber', min: 30, max: 60, color: '#f59e0b', opacity: 0.5 },
  { name: 'green', min: 60, max: 100, color: '#22c55e', opacity: 0.5 },
];

export function createCreatureAxisRanges(): AxisRanges[] {
  return CREATURE_AXES.map((axis) => ({
    axisKey: axis.key,
    ranges: CREATURE_RANGES,
  }));
}
