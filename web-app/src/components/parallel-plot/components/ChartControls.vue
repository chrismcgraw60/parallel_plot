<script setup lang="ts">
/**
 * ChartControls Component
 *
 * Provides control buttons for the parallel plot:
 * - Clear All Filters
 * - Filter by Named Range
 * - Optimization controls
 */

import { ref } from 'vue';

// ============================================================================
// Props
// ============================================================================

export interface Props {
  /** Whether any filters are currently active */
  hasActiveFilters?: boolean;
  /** Available named ranges for filtering */
  availableRanges?: string[];
  /** Whether optimization mode is enabled */
  showOptimization?: boolean;
  /** Current top N value for optimization */
  topN?: number;
}

const props = withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
  availableRanges: () => [],
  showOptimization: true,
  topN: 1,
});

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  /** Clear all filters */
  clearFilters: [];
  /** Filter by a named range */
  filterByRange: [rangeName: string];
  /** Optimize for solutions */
  optimize: [topN: number];
}>();

// ============================================================================
// State
// ============================================================================

const optimizeCount = ref(props.topN);

// ============================================================================
// Handlers
// ============================================================================

function handleClearFilters() {
  emit('clearFilters');
}

function handleFilterByRange(rangeName: string) {
  emit('filterByRange', rangeName);
}

function handleOptimize() {
  emit('optimize', optimizeCount.value);
}
</script>

<template>
  <div class="chart-controls">
    <button
      class="control-btn control-btn--secondary"
      :disabled="!hasActiveFilters"
      @click="handleClearFilters"
    >
      Clear All Filters
    </button>

    <button
      v-for="rangeName in availableRanges"
      :key="rangeName"
      class="control-btn control-btn--range"
      @click="handleFilterByRange(rangeName)"
    >
      Filter by {{ rangeName }} Range
    </button>

    <div v-if="showOptimization" class="optimization-controls">
      <input
        v-model.number="optimizeCount"
        type="number"
        min="1"
        max="100"
        class="optimize-input"
      />
      <button
        class="control-btn control-btn--primary"
        @click="handleOptimize"
      >
        Optimize for Solutions
      </button>
    </div>
  </div>
</template>

<style scoped>
.chart-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  flex-wrap: wrap;
}

.control-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s ease;
}

.control-btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn--primary {
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
}

.control-btn--primary:hover:not(:disabled) {
  background: #6d28d9;
}

.control-btn--secondary {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.control-btn--range {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #047857;
}

.control-btn--range:hover {
  background: #d1fae5;
}

.optimization-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.optimize-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}
</style>
