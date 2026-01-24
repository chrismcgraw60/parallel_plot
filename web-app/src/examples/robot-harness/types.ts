/**
 * Robot Demo Types
 *
 * Domain model for the robot visualization example.
 */

import type { DomainObject, AxisConfig, AxisRanges, Range } from '../../components/parallel-plot/types';

/**
 * Robot attribute keys - meaningful robot characteristics.
 */
export type RobotAttributeKey = 'speed' | 'strength' | 'intelligence' | 'battery';

/**
 * Robot domain object with numerical attributes.
 */
export interface Robot extends DomainObject<RobotAttributeKey> {
  /** Robot identifier (e.g., "Robot 1") */
  label: string;
}

/**
 * Robot axis configuration with descriptive labels.
 */
export const ROBOT_AXES: AxisConfig[] = [
  { key: 'speed', label: 'Speed', min: 0, max: 100 },
  { key: 'strength', label: 'Strength', min: 0, max: 100 },
  { key: 'intelligence', label: 'Intelligence', min: 0, max: 100 },
  { key: 'battery', label: 'Battery', min: 0, max: 100 },
];

/**
 * Standard range definitions (RED, AMBER, GREEN).
 * - Red (0-30): Poor/Critical
 * - Amber (30-60): Average/Warning
 * - Green (60-100): Good/Optimal
 */
export const STANDARD_RANGES: Range[] = [
  { name: 'red', min: 0, max: 30, color: '#ef4444', opacity: 0.5 },
  { name: 'amber', min: 30, max: 60, color: '#f59e0b', opacity: 0.5 },
  { name: 'green', min: 60, max: 100, color: '#22c55e', opacity: 0.5 },
];

/**
 * Creates axis ranges configuration for all robot axes.
 */
export function createRobotAxisRanges(): AxisRanges[] {
  return ROBOT_AXES.map((axis) => ({
    axisKey: axis.key,
    ranges: STANDARD_RANGES,
  }));
}
