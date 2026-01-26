/**
 * Parallel Plot Chart - TypeScript Type Definitions
 *
 * Domain vocabulary based on requirements:
 * - DomainObject: Primary entity being visualized (e.g., Robot)
 * - Attribute: Numerical property of a DomainObject
 * - Plot: Visual polyline representation of a DomainObject
 * - Axis: Vertical line representing value range for an Attribute
 * - Range: Defined interval on an Axis with semantic meaning
 * - Brush: Active filter window on an Axis
 * - Solution: DomainObject satisfying optimization criteria
 */

// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * A domain object to be visualized on the parallel plot.
 * Each object has a unique ID, display label, and map of attribute values.
 */
export interface DomainObject<T extends string = string> {
  /** Unique identifier for the domain object */
  id: string;
  /** Display label for the domain object */
  label: string;
  /** Map of attribute name to numerical value */
  values: Record<T, number>;
  /** Optional color for the plot line */
  color?: string;
  /** Optional metadata for external use */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for an axis representing a numerical attribute.
 */
export interface AxisConfig {
  /** Unique key matching the attribute name in DomainObject.values */
  key: string;
  /** Display label for the axis */
  label: string;
  /** Minimum value for the axis scale */
  min: number;
  /** Maximum value for the axis scale */
  max: number;
  /** Optional format function for tick labels */
  tickFormat?: (value: number) => string;
  /** Optional number of ticks to display */
  tickCount?: number;
}

/**
 * A named range on an axis with styling.
 * Used for contextual indicators like "Safe", "Warning", "Critical".
 */
export interface Range {
  /** Unique name for the range (e.g., "green", "amber", "red") */
  name: string;
  /** Minimum value of the range */
  min: number;
  /** Maximum value of the range */
  max: number;
  /** CSS color for the range indicator */
  color: string;
  /** Optional opacity (0-1) */
  opacity?: number;
}

/**
 * Range configuration for a specific axis.
 */
export interface AxisRanges {
  /** Axis key this range configuration applies to */
  axisKey: string;
  /** Array of ranges for this axis */
  ranges: Range[];
}

// ============================================================================
// Brush & Filter Types
// ============================================================================

/**
 * Represents an active brush filter on a single axis.
 */
export interface BrushExtent {
  /** Axis key the brush is applied to */
  axisKey: string;
  /** Minimum selected value */
  min: number;
  /** Maximum selected value */
  max: number;
}

/**
 * Current filter state across all axes.
 */
export interface FilterState {
  /** Array of active brush extents (AND logic applied) */
  brushes: BrushExtent[];
  /** IDs of domain objects passing the filter */
  filteredIds: string[];
  /** Whether any filters are active */
  isFiltered: boolean;
}

// ============================================================================
// Plot Visual State
// ============================================================================

/**
 * Visual state for a single plot line.
 */
export interface PlotState {
  /** Domain object ID */
  id: string;
  /** Whether the plot passes current filters */
  passesFilter: boolean;
  /** Whether the plot is currently selected */
  isSelected: boolean;
  /** Whether the plot is highlighted (hover, external selection, etc.) */
  isHighlighted: boolean;
  /** Whether the plot is a "solution" in optimization mode */
  isSolution: boolean;
}

/**
 * A point where a plot line intersects an axis.
 */
export interface AxisIntersectionPoint {
  /** Axis key */
  axisKey: string;
  /** X coordinate (axis position) */
  x: number;
  /** Y coordinate (value position on axis) */
  y: number;
}

/**
 * Computed plot data combining domain object with visual state.
 */
export interface PlotData<T extends string = string> {
  /** The source domain object */
  domainObject: DomainObject<T>;
  /** Current visual state */
  state: PlotState;
  /** Computed SVG path data */
  pathData?: string;
  /** Intersection points on each axis */
  intersectionPoints?: AxisIntersectionPoint[];
}

// ============================================================================
// Component Props & Events
// ============================================================================

/**
 * Props for the ParallelPlot component.
 */
export interface ParallelPlotProps<T extends string = string> {
  /** Array of domain objects to visualize */
  data: DomainObject<T>[];
  /** Configuration for each axis */
  axes: AxisConfig[];
  /** Optional range definitions per axis */
  ranges?: AxisRanges[];
  /** ID of externally selected domain object (for 2-way binding) */
  externalSelection?: string | null;
  /** Optional configuration overrides */
  config?: ParallelPlotConfig;
}

/**
 * Configuration options for the parallel plot.
 */
export interface ParallelPlotConfig {
  /** Opacity for plots passing filter (default: 1) */
  activeOpacity?: number;
  /** Opacity for plots failing filter (default: 0.1) */
  inactiveOpacity?: number;
  /** Stroke width for plot lines (default: 1.5) */
  strokeWidth?: number;
  /** Stroke width for highlighted/selected plots (default: 2.5) */
  highlightStrokeWidth?: number;
  /** Width of range indicator bars (default: 8) */
  rangeBarWidth?: number;
  /** Margin around the chart */
  margin?: { top: number; right: number; bottom: number; left: number };
  /** Enable smooth line interpolation (default: false) */
  smoothLines?: boolean;
  /** Debounce delay for filter events in ms (default: 100) */
  filterDebounceMs?: number;
  /** Diameter of intersection circles for selected plots (default: 5) */
  intersectionCircleDiameter?: number;
}

/**
 * Default configuration values.
 */
export const DEFAULT_CONFIG: Required<ParallelPlotConfig> = {
  activeOpacity: 1,
  inactiveOpacity: 0.1,
  strokeWidth: 1.5,
  highlightStrokeWidth: 2.5,
  rangeBarWidth: 8,
  margin: { top: 50, right: 50, bottom: 30, left: 50 },
  smoothLines: false,
  filterDebounceMs: 100,
  intersectionCircleDiameter: 5,
};

// ============================================================================
// Event Payloads
// ============================================================================

/**
 * Payload for FilterChange event.
 * Emitted when brush filters change.
 */
export interface FilterChangeEvent {
  /** Current filter state */
  filterState: FilterState;
  /** Source of the filter change */
  source: 'brush' | 'clear' | 'range' | 'external';
}

/**
 * Payload for SelectionChange event.
 * Emitted when internal selection changes.
 */
export interface SelectionChangeEvent {
  /** IDs of selected domain objects */
  selectedIds: string[];
  /** Source of the selection change */
  source: 'click' | 'optimization' | 'external';
}

/**
 * Payload for RequestSelectionChange event.
 * Emitted when the chart wants to update external selection (2-way sync).
 */
export interface RequestSelectionChangeEvent {
  /** Requested selected ID (null to clear) */
  requestedId: string | null;
}

// ============================================================================
// Optimization Types
// ============================================================================

/**
 * Configuration for optimization mode.
 */
export interface OptimizationConfig {
  /** Number of top solutions to select */
  topN: number;
  /** Strategy for ranking solutions */
  strategy: OptimizationStrategy;
  /** Optional weights per axis (for weighted strategy) */
  weights?: Record<string, number>;
}

/**
 * Available optimization strategies.
 */
export type OptimizationStrategy =
  | 'sum'      // Sum of normalized values across all axes
  | 'weighted' // Weighted sum using provided weights
  | 'pareto';  // Pareto-optimal solutions

/**
 * Result of optimization calculation.
 */
export interface OptimizationResult {
  /** IDs of solution domain objects, ranked best to worst */
  solutionIds: string[];
  /** Scores for each solution (if applicable) */
  scores: Map<string, number>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Dimensions for the chart container.
 */
export interface ChartDimensions {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

/**
 * Type guard to check if a value is a valid DomainObject.
 */
export function isDomainObject(value: unknown): value is DomainObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as DomainObject).id === 'string' &&
    typeof (value as DomainObject).label === 'string' &&
    typeof (value as DomainObject).values === 'object'
  );
}

/**
 * Type guard to check if a value is a valid AxisConfig.
 */
export function isAxisConfig(value: unknown): value is AxisConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as AxisConfig).key === 'string' &&
    typeof (value as AxisConfig).label === 'string' &&
    typeof (value as AxisConfig).min === 'number' &&
    typeof (value as AxisConfig).max === 'number'
  );
}
