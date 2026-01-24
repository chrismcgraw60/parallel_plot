/**
 * Robot Demo Types
 *
 * Domain model for the robot visualization example.
 */

import type { DomainObject, AxisConfig, AxisRanges, Range } from '../../components/parallel-plot/types';

/**
 * Robot attribute keys.
 */
export type RobotAttributeKey = 'value2' | 'value3' | 'value4' | 'value5';

/**
 * Robot domain object with numerical attributes.
 */
export interface Robot extends DomainObject<RobotAttributeKey> {
  /** Robot identifier (e.g., "Robot 1") */
  label: string;
}

/**
 * Robot axis configuration.
 */
export const ROBOT_AXES: AxisConfig[] = [
  { key: 'value2', label: 'value2', min: 0, max: 100 },
  { key: 'value3', label: 'value3', min: 0, max: 100 },
  { key: 'value4', label: 'value4', min: 0, max: 100 },
  { key: 'value5', label: 'value5', min: 0, max: 100 },
];

/**
 * Standard range definitions (RED, AMBER, GREEN).
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
