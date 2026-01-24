/**
 * Optimization Utilities for Parallel Plot
 *
 * Implements algorithms for finding "optimal" solutions:
 * - Sum strategy: rank by sum of normalized values
 * - Weighted strategy: rank by weighted sum
 * - Pareto strategy: find Pareto-optimal solutions
 */

import type {
  DomainObject,
  AxisConfig,
  OptimizationConfig,
  OptimizationResult,
} from '../types';

/**
 * Normalizes a value to 0-1 range based on axis min/max.
 */
function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Calculates score for a domain object using sum strategy.
 * Higher values on all axes = higher score.
 */
function calculateSumScore(
  obj: DomainObject,
  axes: AxisConfig[]
): number {
  return axes.reduce((sum, axis) => {
    const value = obj.values[axis.key] ?? 0;
    return sum + normalizeValue(value, axis.min, axis.max);
  }, 0);
}

/**
 * Calculates score for a domain object using weighted strategy.
 */
function calculateWeightedScore(
  obj: DomainObject,
  axes: AxisConfig[],
  weights: Record<string, number>
): number {
  return axes.reduce((sum, axis) => {
    const value = obj.values[axis.key] ?? 0;
    const weight = weights[axis.key] ?? 1;
    return sum + normalizeValue(value, axis.min, axis.max) * weight;
  }, 0);
}

/**
 * Checks if obj1 dominates obj2 (Pareto dominance).
 * obj1 dominates obj2 if obj1 is >= on all axes and > on at least one.
 */
function dominates(
  obj1: DomainObject,
  obj2: DomainObject,
  axes: AxisConfig[]
): boolean {
  let dominated = false;
  let strictlyBetter = false;

  for (const axis of axes) {
    const v1 = obj1.values[axis.key] ?? 0;
    const v2 = obj2.values[axis.key] ?? 0;

    if (v1 < v2) {
      dominated = true;
      break;
    }
    if (v1 > v2) {
      strictlyBetter = true;
    }
  }

  return !dominated && strictlyBetter;
}

/**
 * Finds Pareto-optimal solutions.
 * Returns objects that are not dominated by any other object.
 */
function findParetoOptimal(
  data: DomainObject[],
  axes: AxisConfig[]
): DomainObject[] {
  const paretoFront: DomainObject[] = [];

  for (const candidate of data) {
    let dominated = false;

    for (const other of data) {
      if (other.id !== candidate.id && dominates(other, candidate, axes)) {
        dominated = true;
        break;
      }
    }

    if (!dominated) {
      paretoFront.push(candidate);
    }
  }

  return paretoFront;
}

/**
 * Finds the top N optimal solutions based on the given strategy.
 *
 * @param data - Array of domain objects to optimize over
 * @param axes - Axis configurations
 * @param config - Optimization configuration
 * @returns Optimization result with ranked solution IDs
 */
export function findOptimalSolutions(
  data: DomainObject[],
  axes: AxisConfig[],
  config: OptimizationConfig
): OptimizationResult {
  const { topN, strategy, weights } = config;
  const scores = new Map<string, number>();

  if (strategy === 'pareto') {
    // For Pareto, find the front then rank by sum score
    const paretoFront = findParetoOptimal(data, axes);

    // Calculate sum scores for Pareto front
    for (const obj of paretoFront) {
      scores.set(obj.id, calculateSumScore(obj, axes));
    }

    // Sort by score and take top N
    const sorted = paretoFront
      .sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0))
      .slice(0, topN);

    return {
      solutionIds: sorted.map((obj) => obj.id),
      scores,
    };
  }

  // Sum or weighted strategy
  for (const obj of data) {
    const score =
      strategy === 'weighted' && weights
        ? calculateWeightedScore(obj, axes, weights)
        : calculateSumScore(obj, axes);
    scores.set(obj.id, score);
  }

  // Sort by score descending and take top N
  const sorted = [...data]
    .sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0))
    .slice(0, topN);

  return {
    solutionIds: sorted.map((obj) => obj.id),
    scores,
  };
}

/**
 * Convenience function for sum-based optimization.
 */
export function findTopNBySumScore(
  data: DomainObject[],
  axes: AxisConfig[],
  topN: number
): OptimizationResult {
  return findOptimalSolutions(data, axes, {
    topN,
    strategy: 'sum',
  });
}
