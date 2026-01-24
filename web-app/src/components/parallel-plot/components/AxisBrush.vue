<script setup lang="ts">
/**
 * AxisBrush Component
 *
 * Handles D3 brush interaction on a single axis.
 */

import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';
import type { BrushExtent } from '../types';
import { pixelToValue, valueToPixel, type YScale } from '../utils/scales';

// ============================================================================
// Props
// ============================================================================

export interface Props {
  /** Axis key */
  axisKey: string;
  /** X position of the axis */
  x: number;
  /** Height of the brush area */
  height: number;
  /** Y-scale for this axis */
  scale: YScale;
  /** Current brush extent (if any) */
  extent?: BrushExtent | null;
  /** Width of the brush interaction area */
  brushWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  extent: null,
  brushWidth: 30,
});

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  /** Emitted when brush selection changes */
  brushChange: [extent: BrushExtent | null];
  /** Emitted when brush interaction starts */
  brushStart: [];
  /** Emitted when brush interaction ends */
  brushEnd: [];
}>();

// ============================================================================
// Refs
// ============================================================================

const brushGroupRef = ref<SVGGElement | null>(null);
let brushBehavior: d3.BrushBehavior<unknown> | null = null;
let isBrushing = false;

// ============================================================================
// Brush Setup
// ============================================================================

function setupBrush() {
  if (!brushGroupRef.value) return;

  const halfWidth = props.brushWidth / 2;

  brushBehavior = d3
    .brushY()
    .extent([
      [-halfWidth, 0],
      [halfWidth, props.height],
    ])
    .on('start', handleBrushStart)
    .on('brush', handleBrush)
    .on('end', handleBrushEnd);

  const brushGroup = d3.select(brushGroupRef.value);

  // Apply brush behavior
  brushGroup.call(brushBehavior);

  // Style the brush
  brushGroup
    .select('.selection')
    .attr('fill', '#69b3a2')
    .attr('fill-opacity', 0.3)
    .attr('stroke', '#69b3a2')
    .attr('stroke-width', 1);

  // Style the handles
  brushGroup
    .selectAll('.handle')
    .attr('fill', '#69b3a2')
    .attr('stroke', '#458b74');

  // If there's an initial extent, set it
  if (props.extent) {
    const yScaleMap = new Map([[props.axisKey, props.scale]]);
    const { y1, y2 } = valueToPixel(
      props.extent.min,
      props.extent.max,
      props.axisKey,
      yScaleMap
    );
    brushGroup.call(brushBehavior.move, [y1, y2]);
  }
}

function handleBrushStart() {
  isBrushing = true;
  emit('brushStart');
}

function handleBrush(event: d3.D3BrushEvent<unknown>) {
  if (!event.selection) return;

  const [y1, y2] = event.selection as [number, number];
  const yScaleMap = new Map([[props.axisKey, props.scale]]);
  const { min, max } = pixelToValue(y1, y2, props.axisKey, yScaleMap);

  emit('brushChange', {
    axisKey: props.axisKey,
    min,
    max,
  });
}

function handleBrushEnd(event: d3.D3BrushEvent<unknown>) {
  isBrushing = false;

  if (!event.selection) {
    // Brush was cleared
    emit('brushChange', null);
  }

  emit('brushEnd');
}

// ============================================================================
// Public Methods
// ============================================================================

/** Programmatically clear the brush */
function clearBrush() {
  if (brushGroupRef.value && brushBehavior) {
    d3.select(brushGroupRef.value).call(brushBehavior.move, null);
  }
}

/** Programmatically set the brush extent */
function setBrushExtent(min: number, max: number) {
  if (!brushGroupRef.value || !brushBehavior) return;

  const yScaleMap = new Map([[props.axisKey, props.scale]]);
  const { y1, y2 } = valueToPixel(min, max, props.axisKey, yScaleMap);
  d3.select(brushGroupRef.value).call(brushBehavior.move, [y1, y2]);
}

defineExpose({
  clearBrush,
  setBrushExtent,
});

// ============================================================================
// Watchers
// ============================================================================

// Watch for external extent changes
watch(
  () => props.extent,
  (newExtent) => {
    if (isBrushing) return; // Don't update while user is brushing

    if (!newExtent) {
      clearBrush();
    } else {
      setBrushExtent(newExtent.min, newExtent.max);
    }
  }
);

// Watch for scale/height changes
watch(
  () => [props.scale, props.height],
  () => setupBrush()
);

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  setupBrush();
});

onUnmounted(() => {
  brushBehavior = null;
});
</script>

<template>
  <g
    ref="brushGroupRef"
    class="axis-brush"
    :transform="`translate(${x}, 0)`"
  />
</template>

<style scoped>
.axis-brush {
  cursor: crosshair;
}
</style>
