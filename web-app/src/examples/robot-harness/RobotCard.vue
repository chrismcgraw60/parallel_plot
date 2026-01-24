<script setup lang="ts">
/**
 * RobotCard Component
 *
 * Displays a single robot with its icon and attributes.
 */

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
    <!-- Simple robot icon -->
    <svg
      class="robot-icon"
      viewBox="0 0 40 50"
      :style="{ color: robot.color }"
    >
      <!-- Head -->
      <rect x="8" y="0" width="24" height="20" rx="4" fill="currentColor" />
      <!-- Eyes -->
      <circle cx="15" cy="10" r="3" fill="white" />
      <circle cx="25" cy="10" r="3" fill="white" />
      <circle cx="15" cy="10" r="1.5" fill="#333" />
      <circle cx="25" cy="10" r="1.5" fill="#333" />
      <!-- Antenna -->
      <line x1="20" y1="0" x2="20" y2="-5" stroke="currentColor" stroke-width="2" />
      <circle cx="20" cy="-7" r="3" fill="currentColor" />
      <!-- Body -->
      <rect x="5" y="22" width="30" height="25" rx="3" fill="currentColor" />
      <!-- Arms -->
      <rect x="0" y="24" width="5" height="15" rx="2" fill="currentColor" />
      <rect x="35" y="24" width="5" height="15" rx="2" fill="currentColor" />
      <!-- Legs -->
      <rect x="10" y="47" width="7" height="8" rx="2" fill="currentColor" />
      <rect x="23" y="47" width="7" height="8" rx="2" fill="currentColor" />
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
  width: 40px;
  height: 55px;
  margin-bottom: 4px;
}

.robot-label {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
}
</style>
