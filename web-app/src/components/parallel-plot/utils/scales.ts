/**
 * D3 Scale Utilities for Parallel Plot
 *
 * Provides scale creation and coordinate mapping for:
 * - Y-axis scales (linear scales for attribute values)
 * - X-axis positioning (band scale for parallel axis placement)
 * - Coordinate transformation utilities
 */

import * as d3 from 'd3';
import type {
  AxisConfig,
  ChartDimensions,
  DomainObject,
} from '../types';

// ============================================================================
// Scale Types
// ============================================================================

/**
 * Linear scale for a single Y-axis.
 */
export type YScale = d3.ScaleLinear<number, number>;

/**
 * Map of axis key to its Y-scale.
 */
export type YScaleMap = Map<string, YScale>;

/**
 * Scale for positioning axes along the X-axis.
 */
export type XPositionScale = d3.ScalePoint<string>;

// ============================================================================
// Scale Creation
// ============================================================================

/**
 * Creates a Y-scale for a single axis.
 *
 * @param axis - Axis configuration
 * @param height - Available height for the scale range
 * @returns D3 linear scale mapping domain values to Y coordinates
 */
export function createYScale(axis: AxisConfig, height: number): YScale {
  return d3
    .scaleLinear()
    .domain([axis.min, axis.max])
    .range([height, 0]) // Inverted: higher values at top
    .nice();
}

/**
 * Creates Y-scales for all axes.
 *
 * @param axes - Array of axis configurations
 * @param height - Available height for scales
 * @returns Map of axis key to Y-scale
 */
export function createYScales(axes: AxisConfig[], height: number): YScaleMap {
  const scales = new Map<string, YScale>();

  for (const axis of axes) {
    scales.set(axis.key, createYScale(axis, height));
  }

  return scales;
}

/**
 * Creates an X-position scale for placing axes horizontally.
 *
 * @param axes - Array of axis configurations
 * @param width - Available width for axis placement
 * @returns D3 point scale mapping axis keys to X positions
 */
export function createXPositionScale(
  axes: AxisConfig[],
  width: number
): XPositionScale {
  return d3
    .scalePoint<string>()
    .domain(axes.map((a) => a.key))
    .range([0, width])
    .padding(0.1);
}

// ============================================================================
// Coordinate Mapping
// ============================================================================

/**
 * Gets the X coordinate for a specific axis.
 *
 * @param axisKey - Key of the axis
 * @param xScale - X position scale
 * @returns X coordinate, or 0 if axis not found
 */
export function getAxisX(axisKey: string, xScale: XPositionScale): number {
  return xScale(axisKey) ?? 0;
}

/**
 * Gets the Y coordinate for a value on a specific axis.
 *
 * @param value - The domain value
 * @param axisKey - Key of the axis
 * @param yScales - Map of Y-scales
 * @returns Y coordinate, or 0 if axis not found
 */
export function getValueY(
  value: number,
  axisKey: string,
  yScales: YScaleMap
): number {
  const scale = yScales.get(axisKey);
  return scale ? scale(value) : 0;
}

/**
 * Gets the [x, y] coordinate for a domain object's value on a specific axis.
 *
 * @param domainObject - The domain object
 * @param axisKey - Key of the axis
 * @param xScale - X position scale
 * @param yScales - Map of Y-scales
 * @returns [x, y] coordinate tuple
 */
export function getPointCoordinate(
  domainObject: DomainObject,
  axisKey: string,
  xScale: XPositionScale,
  yScales: YScaleMap
): [number, number] {
  const x = getAxisX(axisKey, xScale);
  const value = domainObject.values[axisKey];
  const y = getValueY(value ?? 0, axisKey, yScales);
  return [x, y];
}

// ============================================================================
// Path Generation
// ============================================================================

/**
 * Generates SVG path data for a domain object across all axes.
 *
 * @param domainObject - The domain object to create path for
 * @param axes - Array of axis configurations (determines order)
 * @param xScale - X position scale
 * @param yScales - Map of Y-scales
 * @param smooth - Whether to use smooth curve interpolation
 * @returns SVG path data string
 */
export function generatePathData(
  domainObject: DomainObject,
  axes: AxisConfig[],
  xScale: XPositionScale,
  yScales: YScaleMap,
  smooth: boolean = false
): string {
  const points: [number, number][] = axes.map((axis) =>
    getPointCoordinate(domainObject, axis.key, xScale, yScales)
  );

  const lineGenerator = smooth
    ? d3.line().curve(d3.curveMonotoneX)
    : d3.line();

  return lineGenerator(points) ?? '';
}

/**
 * Generates path data for all domain objects.
 *
 * @param data - Array of domain objects
 * @param axes - Array of axis configurations
 * @param xScale - X position scale
 * @param yScales - Map of Y-scales
 * @param smooth - Whether to use smooth curve interpolation
 * @returns Map of domain object ID to path data
 */
export function generateAllPathData(
  data: DomainObject[],
  axes: AxisConfig[],
  xScale: XPositionScale,
  yScales: YScaleMap,
  smooth: boolean = false
): Map<string, string> {
  const paths = new Map<string, string>();

  for (const obj of data) {
    paths.set(obj.id, generatePathData(obj, axes, xScale, yScales, smooth));
  }

  return paths;
}

// ============================================================================
// Dimension Utilities
// ============================================================================

/**
 * Calculates chart dimensions from container size and margin config.
 *
 * @param containerWidth - Width of the container element
 * @param containerHeight - Height of the container element
 * @param margin - Margin configuration
 * @returns Computed chart dimensions
 */
export function calculateDimensions(
  containerWidth: number,
  containerHeight: number,
  margin: { top: number; right: number; bottom: number; left: number }
): ChartDimensions {
  const innerWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const innerHeight = Math.max(0, containerHeight - margin.top - margin.bottom);

  return {
    width: containerWidth,
    height: containerHeight,
    innerWidth,
    innerHeight,
    margin,
  };
}

// ============================================================================
// Range Coordinate Utilities
// ============================================================================

/**
 * Gets Y coordinates for a range on a specific axis.
 *
 * @param rangeMin - Minimum value of the range
 * @param rangeMax - Maximum value of the range
 * @param axisKey - Key of the axis
 * @param yScales - Map of Y-scales
 * @returns Object with y1 (top) and y2 (bottom) coordinates, and height
 */
export function getRangeCoordinates(
  rangeMin: number,
  rangeMax: number,
  axisKey: string,
  yScales: YScaleMap
): { y1: number; y2: number; height: number } {
  const scale = yScales.get(axisKey);
  if (!scale) {
    return { y1: 0, y2: 0, height: 0 };
  }

  // Note: Y scale is inverted (higher values = lower Y coordinate)
  const y1 = scale(rangeMax); // Top of range (higher value)
  const y2 = scale(rangeMin); // Bottom of range (lower value)

  return {
    y1,
    y2,
    height: Math.abs(y2 - y1),
  };
}

// ============================================================================
// Inverse Scale Operations (for brush)
// ============================================================================

/**
 * Converts Y pixel coordinates back to domain values.
 * Used for brush interaction to determine selected value range.
 *
 * @param y1 - First Y coordinate (pixel)
 * @param y2 - Second Y coordinate (pixel)
 * @param axisKey - Key of the axis
 * @param yScales - Map of Y-scales
 * @returns Object with min and max domain values
 */
export function pixelToValue(
  y1: number,
  y2: number,
  axisKey: string,
  yScales: YScaleMap
): { min: number; max: number } {
  const scale = yScales.get(axisKey);
  if (!scale) {
    return { min: 0, max: 0 };
  }

  // Invert the scale to get domain values
  const v1 = scale.invert(y1);
  const v2 = scale.invert(y2);

  // Return in min/max order (note: Y is inverted)
  return {
    min: Math.min(v1, v2),
    max: Math.max(v1, v2),
  };
}

/**
 * Converts domain values to Y pixel coordinates.
 * Used for programmatically setting brush positions.
 *
 * @param min - Minimum domain value
 * @param max - Maximum domain value
 * @param axisKey - Key of the axis
 * @param yScales - Map of Y-scales
 * @returns Object with y1 (top) and y2 (bottom) pixel coordinates
 */
export function valueToPixel(
  min: number,
  max: number,
  axisKey: string,
  yScales: YScaleMap
): { y1: number; y2: number } {
  const scale = yScales.get(axisKey);
  if (!scale) {
    return { y1: 0, y2: 0 };
  }

  return {
    y1: scale(max), // Higher value = lower Y (top)
    y2: scale(min), // Lower value = higher Y (bottom)
  };
}
