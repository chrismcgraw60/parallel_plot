<script setup lang="ts">
/**
 * RangeBar Component
 *
 * Renders colored range indicators alongside an axis.
 */

import { computed } from 'vue';
import type { Range, AxisRanges } from '../types';
import { getRangeCoordinates, type YScaleMap } from '../utils/scales';

// ============================================================================
// Props
// ============================================================================

export interface Props {
  /** Axis ranges configuration */
  axisRanges: AxisRanges;
  /** X position of the parent axis */
  axisX: number;
  /** Y-scales map */
  yScales: YScaleMap;
  /** Width of the range bar */
  barWidth?: number;
  /** Offset from axis line */
  offset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  barWidth: 8,
  offset: 4,
});

// ============================================================================
// Computed
// ============================================================================

interface RangeRect {
  range: Range;
  x: number;
  y: number;
  width: number;
  height: number;
}

const rangeRects = computed<RangeRect[]>(() => {
  const { axisKey, ranges } = props.axisRanges;

  return ranges.map((range) => {
    const coords = getRangeCoordinates(
      range.min,
      range.max,
      axisKey,
      props.yScales
    );

    return {
      range,
      x: props.axisX + props.offset,
      y: coords.y1,
      width: props.barWidth,
      height: coords.height,
    };
  });
});
</script>

<template>
  <g class="range-bars">
    <rect
      v-for="rect in rangeRects"
      :key="`${axisRanges.axisKey}-${rect.range.name}`"
      :x="rect.x"
      :y="rect.y"
      :width="rect.width"
      :height="rect.height"
      :fill="rect.range.color"
      :opacity="rect.range.opacity ?? 0.6"
      class="range-bar"
    />
  </g>
</template>

<style scoped>
.range-bar {
  pointer-events: none;
}
</style>
