<script setup lang="ts">
/**
 * RobotCard Component
 *
 * Displays a single robot with SVG that reflects its attributes:
 * - Speed: leg length (longer = faster)
 * - Strength: arm width (thicker = stronger)
 * - Intelligence: head size (larger = smarter)
 * - Battery: energy bar on body
 */

import { computed } from 'vue';
import type { Robot } from './types';

// ============================================================================
// Props
// ============================================================================

export interface Props {
  robot: Robot;
  isFiltered?: boolean;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isFiltered: true,
  isSelected: false,
});

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  select: [robotId: string];
}>();

// ============================================================================
// Computed - Attribute-based dimensions
// ============================================================================

// Normalize 0-100 to useful ranges for SVG dimensions
const normalize = (value: number, min: number, max: number) =>
  min + (value / 100) * (max - min);

// Speed affects leg length (5-12)
const legLength = computed(() => normalize(props.robot.values.speed, 5, 12));

// Strength affects arm width (3-7)
const armWidth = computed(() => normalize(props.robot.values.strength, 3, 7));

// Intelligence affects head size (16-24)
const headSize = computed(() => normalize(props.robot.values.intelligence, 16, 24));

// Battery level (0-100) - shown as fill percentage
const batteryLevel = computed(() => props.robot.values.battery);

// Battery color based on level
const batteryColor = computed(() => {
  const level = batteryLevel.value;
  if (level >= 60) return '#22c55e'; // green
  if (level >= 30) return '#f59e0b'; // amber
  return '#ef4444'; // red
});

// ============================================================================
// Handlers
// ============================================================================

function handleClick() {
  emit('select', props.robot.id);
}
</script>

<template>
  <div
    class="robot-card"
    :class="{
      'robot-card--filtered': !isFiltered,
      'robot-card--selected': isSelected,
    }"
    @click="handleClick"
  >
    <!-- Attribute-reactive robot SVG -->
    <svg
      class="robot-icon"
      viewBox="0 0 50 70"
      :style="{ color: robot.color }"
    >
      <!-- Antenna (scales with intelligence) -->
      <line
        x1="25"
        y1="8"
        x2="25"
        :y2="8 - headSize / 3"
        stroke="currentColor"
        stroke-width="2"
      />
      <circle
        cx="25"
        :cy="6 - headSize / 3"
        :r="2 + headSize / 12"
        fill="currentColor"
      />

      <!-- Head (size based on intelligence) -->
      <rect
        :x="25 - headSize / 2"
        y="8"
        :width="headSize"
        :height="headSize * 0.8"
        rx="3"
        fill="currentColor"
      />
      <!-- Eyes -->
      <circle
        :cx="25 - headSize / 4"
        :cy="8 + headSize * 0.35"
        r="2.5"
        fill="white"
      />
      <circle
        :cx="25 + headSize / 4"
        :cy="8 + headSize * 0.35"
        r="2.5"
        fill="white"
      />
      <circle
        :cx="25 - headSize / 4"
        :cy="8 + headSize * 0.35"
        r="1"
        fill="#333"
      />
      <circle
        :cx="25 + headSize / 4"
        :cy="8 + headSize * 0.35"
        r="1"
        fill="#333"
      />

      <!-- Body -->
      <rect
        x="10"
        :y="10 + headSize * 0.8"
        width="30"
        height="22"
        rx="3"
        fill="currentColor"
      />

      <!-- Battery indicator on body -->
      <rect
        x="14"
        :y="14 + headSize * 0.8"
        width="22"
        height="8"
        rx="1"
        fill="#333"
        opacity="0.3"
      />
      <rect
        x="14"
        :y="14 + headSize * 0.8"
        :width="22 * (batteryLevel / 100)"
        height="8"
        rx="1"
        :fill="batteryColor"
      />

      <!-- Arms (width based on strength) -->
      <rect
        :x="10 - armWidth"
        :y="14 + headSize * 0.8"
        :width="armWidth"
        height="14"
        rx="2"
        fill="currentColor"
      />
      <rect
        x="40"
        :y="14 + headSize * 0.8"
        :width="armWidth"
        height="14"
        rx="2"
        fill="currentColor"
      />

      <!-- Legs (length based on speed) -->
      <rect
        x="15"
        :y="32 + headSize * 0.8"
        width="7"
        :height="legLength"
        rx="2"
        fill="currentColor"
      />
      <rect
        x="28"
        :y="32 + headSize * 0.8"
        width="7"
        :height="legLength"
        rx="2"
        fill="currentColor"
      />

      <!-- Feet (small) -->
      <ellipse
        cx="18.5"
        :cy="32 + headSize * 0.8 + legLength + 2"
        rx="5"
        ry="2"
        fill="currentColor"
      />
      <ellipse
        cx="31.5"
        :cy="32 + headSize * 0.8 + legLength + 2"
        rx="5"
        ry="2"
        fill="currentColor"
      />
    </svg>

    <span class="robot-label">{{ robot.label }}</span>
  </div>
</template>

<style scoped>
.robot-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #f9fafb;
}

.robot-card:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.robot-card--selected {
  background: #ede9fe;
  border-color: #8b5cf6;
}

.robot-card--filtered {
  opacity: 0.3;
}

.robot-icon {
  width: 50px;
  height: 70px;
  margin-bottom: 4px;
}

.robot-label {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
}
</style>
