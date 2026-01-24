<script setup lang="ts">
/**
 * RobotGrid Component
 *
 * Displays a grid of robot cards with filtering support.
 */

import { computed } from 'vue';
import type { Robot } from './types';
import RobotCard from './RobotCard.vue';

// ============================================================================
// Props
// ============================================================================

export interface Props {
  robots: Robot[];
  filteredIds: string[];
  selectedId?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  selectedId: null,
});

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  select: [robotId: string];
}>();

// ============================================================================
// Computed
// ============================================================================

const filteredCount = computed(() => props.filteredIds.length);

const filteredIdSet = computed(() => new Set(props.filteredIds));
</script>

<template>
  <div class="robot-grid-container">
    <h3 class="robot-grid-header">
      Filtered Robots ({{ filteredCount }})
    </h3>

    <div class="robot-grid">
      <RobotCard
        v-for="robot in robots"
        :key="robot.id"
        :robot="robot"
        :is-filtered="filteredIdSet.has(robot.id)"
        :is-selected="selectedId === robot.id"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.robot-grid-container {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.robot-grid-header {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.robot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
}
</style>
