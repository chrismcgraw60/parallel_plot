<script setup lang="ts">
/**
 * Axis Component
 *
 * Renders a single vertical axis with ticks and labels.
 */

import { ref, computed, watch, onMounted } from 'vue';
import * as d3 from 'd3';
import type { AxisConfig } from '../types';
import type { YScale } from '../utils/scales';

// ============================================================================
// Props
// ============================================================================

export interface Props {
  /** Axis configuration */
  config: AxisConfig;
  /** Y-scale for this axis */
  scale: YScale;
  /** X position for this axis */
  x: number;
  /** Height of the axis */
  height: number;
}

const props = defineProps<Props>();

// ============================================================================
// Refs
// ============================================================================

const axisGroupRef = ref<SVGGElement | null>(null);

// ============================================================================
// Computed
// ============================================================================

const tickFormat = computed(() => {
  return props.config.tickFormat ?? d3.format('.0f');
});

const tickCount = computed(() => {
  return props.config.tickCount ?? 5;
});

// ============================================================================
// D3 Axis Rendering
// ============================================================================

function renderAxis() {
  if (!axisGroupRef.value) return;

  const axis = d3
    .axisLeft(props.scale)
    .ticks(tickCount.value)
    .tickFormat(tickFormat.value as (d: d3.NumberValue) => string);

  d3.select(axisGroupRef.value)
    .call(axis)
    .call((g) => {
      // Style the axis line
      g.select('.domain').attr('stroke', '#888');

      // Style the tick lines
      g.selectAll('.tick line').attr('stroke', '#ccc');

      // Style the tick text
      g.selectAll('.tick text')
        .attr('fill', '#666')
        .attr('font-size', '11px');
    });
}

// ============================================================================
// Watchers & Lifecycle
// ============================================================================

watch(
  () => [props.scale, props.config],
  () => renderAxis(),
  { deep: true }
);

onMounted(() => {
  renderAxis();
});
</script>

<template>
  <g
    class="axis"
    :transform="`translate(${x}, 0)`"
  >
    <!-- Axis line and ticks (rendered by D3) -->
    <g ref="axisGroupRef" class="axis-ticks" />

    <!-- Axis label -->
    <text
      class="axis-label"
      :x="0"
      :y="-15"
      text-anchor="middle"
      fill="#333"
      font-size="12px"
      font-weight="500"
    >
      {{ config.label }}
    </text>
  </g>
</template>

<style scoped>
.axis-label {
  user-select: none;
}
</style>
