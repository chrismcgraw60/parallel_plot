/**
 * Truck Demo Types
 */

import type { DomainObject, AxisConfig, AxisRanges, Range } from '../../components/parallel-plot/types';

export type TruckAttributeKey = 'horsepower' | 'capacity' | 'efficiency' | 'reliability';

export interface Truck extends DomainObject<TruckAttributeKey> {
  label: string;
}

export const TRUCK_AXES: AxisConfig[] = [
  { key: 'horsepower', label: 'Horsepower', min: 0, max: 500 },
  { key: 'capacity', label: 'Cargo (tons)', min: 0, max: 50 },
  { key: 'efficiency', label: 'MPG', min: 0, max: 30 },
  { key: 'reliability', label: 'Reliability', min: 0, max: 100 },
];

export const TRUCK_RANGES: Range[] = [
  { name: 'red', min: 0, max: 30, color: '#ef4444', opacity: 0.5 },
  { name: 'amber', min: 30, max: 60, color: '#f59e0b', opacity: 0.5 },
  { name: 'green', min: 60, max: 100, color: '#22c55e', opacity: 0.5 },
];

export function createTruckAxisRanges(): AxisRanges[] {
  return TRUCK_AXES.map((axis) => ({
    axisKey: axis.key,
    ranges: TRUCK_RANGES.map(r => ({
      ...r,
      // Scale ranges to axis max
      min: (r.min / 100) * axis.max,
      max: (r.max / 100) * axis.max,
    })),
  }));
}
