<script setup lang="ts">
/**
 * ParallelPlot Component
 *
 * A reusable parallel coordinates chart for visualizing multi-dimensional data.
 * Built with Vue 3 Composition API and D3.
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';
import type {
  DomainObject,
  AxisConfig,
  AxisRanges,
  ParallelPlotConfig,
  FilterState,
  PlotData,
  FilterChangeEvent,
  SelectionChangeEvent,
  RequestSelectionChangeEvent,
  ChartDimensions,
  BrushExtent,
} from '../types';
import { DEFAULT_CONFIG } from '../types';
import {
  createYScales,
  createXPositionScale,
  calculateDimensions,
  generateAllPathData,
  getAxisX,
  type YScaleMap,
  type XPositionScale,
} from '../utils/scales';
import Axis from './Axis.vue';
import RangeBar from './RangeBar.vue';
import AxisBrush from './AxisBrush.vue';

// ============================================================================
// Props
// ============================================================================

export interface Props {
  /** Array of domain objects to visualize */
  data: DomainObject[];
  /** Configuration for each axis */
  axes: AxisConfig[];
  /** Optional range definitions per axis */
  ranges?: AxisRanges[];
  /** ID of externally selected domain object (for 2-way binding) */
  externalSelection?: string | null;
  /** Optional configuration overrides */
  config?: ParallelPlotConfig;
}

const props = withDefaults(defineProps<Props>(), {
  ranges: () => [],
  externalSelection: null,
  config: () => ({}),
});

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  /** Emitted when filter state changes */
  filterChange: [event: FilterChangeEvent];
  /** Emitted when internal selection changes */
  selectionChange: [event: SelectionChangeEvent];
  /** Emitted to request external selection update (2-way sync) */
  requestSelectionChange: [event: RequestSelectionChangeEvent];
}>();

// ============================================================================
// Merged Config
// ============================================================================

const mergedConfig = computed(() => ({
  ...DEFAULT_CONFIG,
  ...props.config,
  margin: {
    ...DEFAULT_CONFIG.margin,
    ...props.config?.margin,
  },
}));

// ============================================================================
// Refs
// ============================================================================

/** Container element ref */
const containerRef = ref<HTMLDivElement | null>(null);

/** Chart dimensions */
const dimensions = ref<ChartDimensions>({
  width: 0,
  height: 0,
  innerWidth: 0,
  innerHeight: 0,
  margin: DEFAULT_CONFIG.margin,
});

/** Y-scales for each axis */
const yScales = ref<YScaleMap>(new Map());

/** X-position scale for axis placement */
const xScale = ref<XPositionScale | null>(null);

/** Current brush extents */
const brushExtents = ref<BrushExtent[]>([]);

/** Internally selected IDs */
const selectedIds = ref<Set<string>>(new Set());

/** Solution IDs from optimization */
const solutionIds = ref<Set<string>>(new Set());

/** Hovered plot ID */
const hoveredId = ref<string | null>(null);

// ============================================================================
// Computed Properties
// ============================================================================

/** IDs of plots passing current filters */
const filteredIds = computed<Set<string>>(() => {
  if (brushExtents.value.length === 0) {
    return new Set(props.data.map((d) => d.id));
  }

  return new Set(
    props.data
      .filter((obj) => {
        // AND logic: must pass ALL brush filters
        return brushExtents.value.every((brush) => {
          const value = obj.values[brush.axisKey] ?? 0;
          return value >= brush.min && value <= brush.max;
        });
      })
      .map((d) => d.id)
  );
});

/** Current filter state */
const filterState = computed<FilterState>(() => ({
  brushes: brushExtents.value,
  filteredIds: Array.from(filteredIds.value),
  isFiltered: brushExtents.value.length > 0,
}));

/** Plot data with visual states */
const plotData = computed<PlotData[]>(() => {
  if (!xScale.value || yScales.value.size === 0) {
    return [];
  }

  const pathDataMap = generateAllPathData(
    props.data,
    props.axes,
    xScale.value,
    yScales.value,
    mergedConfig.value.smoothLines
  );

  return props.data.map((obj) => ({
    domainObject: obj,
    state: {
      id: obj.id,
      passesFilter: filteredIds.value.has(obj.id),
      isSelected: selectedIds.value.has(obj.id),
      isHighlighted:
        hoveredId.value === obj.id ||
        props.externalSelection === obj.id,
      isSolution: solutionIds.value.has(obj.id),
    },
    pathData: pathDataMap.get(obj.id),
  }));
});

/** Sorted plot data - inactive plots rendered first (underneath) */
const sortedPlotData = computed(() => {
  return [...plotData.value].sort((a, b) => {
    // Render order: inactive -> active -> highlighted -> selected
    const scoreA = getPlotRenderScore(a);
    const scoreB = getPlotRenderScore(b);
    return scoreA - scoreB;
  });
});

/** Axis render data with positions and scales */
const axisRenderData = computed(() => {
  if (!xScale.value) return [];

  return props.axes.map((config) => ({
    config,
    x: getAxisX(config.key, xScale.value!),
    scale: yScales.value.get(config.key),
  }));
});

/** Range bars render data */
const rangeBarData = computed(() => {
  if (!xScale.value) return [];

  return (props.ranges ?? []).map((axisRanges) => ({
    axisRanges,
    x: getAxisX(axisRanges.axisKey, xScale.value!),
  }));
});

/** Brush render data */
const brushRenderData = computed(() => {
  if (!xScale.value) return [];

  return props.axes.map((config) => ({
    axisKey: config.key,
    x: getAxisX(config.key, xScale.value!),
    scale: yScales.value.get(config.key),
    extent: brushExtents.value.find((b) => b.axisKey === config.key) ?? null,
  }));
});

// ============================================================================
// Helper Functions
// ============================================================================

function getPlotRenderScore(plot: PlotData): number {
  let score = 0;
  if (plot.state.passesFilter) score += 1;
  if (plot.state.isHighlighted) score += 2;
  if (plot.state.isSelected) score += 4;
  if (plot.state.isSolution) score += 8;
  return score;
}

function getPlotOpacity(plot: PlotData): number {
  if (!plot.state.passesFilter) {
    return mergedConfig.value.inactiveOpacity;
  }
  return mergedConfig.value.activeOpacity;
}

function getPlotStrokeWidth(plot: PlotData): number {
  if (plot.state.isHighlighted || plot.state.isSelected || plot.state.isSolution) {
    return mergedConfig.value.highlightStrokeWidth;
  }
  return mergedConfig.value.strokeWidth;
}

function getPlotColor(plot: PlotData): string {
  if (plot.domainObject.color) {
    return plot.domainObject.color;
  }
  const index = props.data.indexOf(plot.domainObject) % 10;
  return d3.schemeCategory10[index] ?? '#666';
}

// ============================================================================
// Resize Handling
// ============================================================================

let resizeObserver: ResizeObserver | null = null;

function updateDimensions() {
  if (!containerRef.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  dimensions.value = calculateDimensions(
    rect.width,
    rect.height,
    mergedConfig.value.margin
  );

  // Update scales when dimensions change
  updateScales();
}

function updateScales() {
  if (dimensions.value.innerWidth <= 0 || dimensions.value.innerHeight <= 0) {
    return;
  }

  yScales.value = createYScales(props.axes, dimensions.value.innerHeight);
  xScale.value = createXPositionScale(props.axes, dimensions.value.innerWidth);
}

// ============================================================================
// Event Handlers
// ============================================================================

function handlePlotClick(plot: PlotData) {
  const id = plot.domainObject.id;

  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.clear();
    selectedIds.value.add(id);
  }

  emit('selectionChange', {
    selectedIds: Array.from(selectedIds.value),
    source: 'click',
  });

  emit('requestSelectionChange', {
    requestedId: selectedIds.value.size === 1 ? id : null,
  });
}

function handlePlotHover(plot: PlotData | null) {
  hoveredId.value = plot?.domainObject.id ?? null;
}

function handleBrushChange(extent: BrushExtent | null, axisKey: string) {
  if (extent) {
    setBrushExtent(axisKey, extent.min, extent.max);
  } else {
    clearBrush(axisKey);
  }
}

// ============================================================================
// Public Methods (exposed to parent)
// ============================================================================

/** Clears all brush filters */
function clearAllFilters() {
  brushExtents.value = [];
  emit('filterChange', {
    filterState: filterState.value,
    source: 'clear',
  });
}

/** Filters by a named range across all axes */
function filterByNamedRange(rangeName: string) {
  const newBrushes: BrushExtent[] = [];

  for (const axisRanges of props.ranges ?? []) {
    const range = axisRanges.ranges.find((r) => r.name === rangeName);
    if (range) {
      newBrushes.push({
        axisKey: axisRanges.axisKey,
        min: range.min,
        max: range.max,
      });
    }
  }

  brushExtents.value = newBrushes;
  emit('filterChange', {
    filterState: filterState.value,
    source: 'range',
  });
}

/** Sets the brush extent for a specific axis */
function setBrushExtent(axisKey: string, min: number, max: number) {
  const existingIndex = brushExtents.value.findIndex(
    (b) => b.axisKey === axisKey
  );

  if (existingIndex >= 0) {
    brushExtents.value[existingIndex] = { axisKey, min, max };
  } else {
    brushExtents.value.push({ axisKey, min, max });
  }

  emit('filterChange', {
    filterState: filterState.value,
    source: 'brush',
  });
}

/** Clears the brush for a specific axis */
function clearBrush(axisKey: string) {
  brushExtents.value = brushExtents.value.filter(
    (b) => b.axisKey !== axisKey
  );

  emit('filterChange', {
    filterState: filterState.value,
    source: 'brush',
  });
}

/** Sets solution IDs for optimization mode */
function setSolutions(ids: string[]) {
  solutionIds.value = new Set(ids);
  emit('selectionChange', {
    selectedIds: ids,
    source: 'optimization',
  });
}

/** Clears optimization solutions */
function clearSolutions() {
  solutionIds.value.clear();
}

// Expose methods to parent
defineExpose({
  clearAllFilters,
  filterByNamedRange,
  setBrushExtent,
  clearBrush,
  setSolutions,
  clearSolutions,
  filterState,
  dimensions,
});

// ============================================================================
// Watchers
// ============================================================================

// Watch for external selection changes
watch(
  () => props.externalSelection,
  (newId) => {
    if (newId) {
      selectedIds.value.clear();
      selectedIds.value.add(newId);
    } else {
      selectedIds.value.clear();
    }
  }
);

// Watch for axes changes
watch(
  () => props.axes,
  () => updateScales(),
  { deep: true }
);

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.value);
    updateDimensions();
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div ref="containerRef" class="parallel-plot-container">
    <svg
      :width="dimensions.width"
      :height="dimensions.height"
      class="parallel-plot-svg"
    >
      <g
        class="chart-content"
        :transform="`translate(${dimensions.margin.left}, ${dimensions.margin.top})`"
      >
        <!-- Range bars layer (rendered first, underneath everything) -->
        <g class="ranges-layer">
          <RangeBar
            v-for="rangeData in rangeBarData"
            :key="rangeData.axisRanges.axisKey"
            :axis-ranges="rangeData.axisRanges"
            :axis-x="rangeData.x"
            :y-scales="yScales"
            :bar-width="mergedConfig.rangeBarWidth"
          />
        </g>

        <!-- Axes layer -->
        <g class="axes-layer">
          <Axis
            v-for="axis in axisRenderData"
            :key="axis.config.key"
            :config="axis.config"
            :scale="axis.scale!"
            :x="axis.x"
            :height="dimensions.innerHeight"
          />
        </g>

        <!-- Plots layer -->
        <g class="plots-layer">
          <path
            v-for="plot in sortedPlotData"
            :key="plot.domainObject.id"
            :d="plot.pathData"
            :stroke="getPlotColor(plot)"
            :stroke-width="getPlotStrokeWidth(plot)"
            :opacity="getPlotOpacity(plot)"
            fill="none"
            class="plot-line"
            :class="{
              'plot-line--active': plot.state.passesFilter,
              'plot-line--inactive': !plot.state.passesFilter,
              'plot-line--selected': plot.state.isSelected,
              'plot-line--highlighted': plot.state.isHighlighted,
              'plot-line--solution': plot.state.isSolution,
            }"
            @click="handlePlotClick(plot)"
            @mouseenter="handlePlotHover(plot)"
            @mouseleave="handlePlotHover(null)"
          />
        </g>

        <!-- Brush layer (rendered last, on top) -->
        <g class="brush-layer">
          <AxisBrush
            v-for="brush in brushRenderData"
            :key="brush.axisKey"
            :axis-key="brush.axisKey"
            :x="brush.x"
            :height="dimensions.innerHeight"
            :scale="brush.scale!"
            :extent="brush.extent"
            @brush-change="(extent) => handleBrushChange(extent, brush.axisKey)"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.parallel-plot-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.parallel-plot-svg {
  display: block;
}

.plot-line {
  cursor: pointer;
  transition: opacity 0.15s ease, stroke-width 0.15s ease;
}

.plot-line--inactive {
  pointer-events: none;
}

.plot-line--highlighted {
  filter: drop-shadow(0 0 2px currentColor);
}

.plot-line--solution {
  stroke-dasharray: none;
}
</style>
