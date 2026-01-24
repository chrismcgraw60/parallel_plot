<script setup lang="ts">
/**
 * RobotDemo Component
 *
 * Full demonstration of the ParallelPlot component with robot data.
 */

import { ref } from 'vue';
import { ParallelPlot } from '../../components/parallel-plot';
import ChartControls from '../../components/parallel-plot/components/ChartControls.vue';
import { findTopNBySumScore } from '../../components/parallel-plot/utils/optimization';
import type { FilterChangeEvent, SelectionChangeEvent } from '../../components/parallel-plot/types';
import { ROBOT_AXES, createRobotAxisRanges } from './types';
import { SAMPLE_ROBOTS, generateRobots } from './data';
import RobotGrid from './RobotGrid.vue';

// ============================================================================
// Data
// ============================================================================

const robots = ref(SAMPLE_ROBOTS);
const axisRanges = createRobotAxisRanges();
const availableRanges = ['green', 'amber', 'red'];

// ============================================================================
// State
// ============================================================================

const parallelPlotRef = ref<InstanceType<typeof ParallelPlot> | null>(null);
const filteredIds = ref<string[]>(robots.value.map((r) => r.id));
const selectedId = ref<string | null>(null);
const hasActiveFilters = ref(false);
const hasActiveSolutions = ref(false);

// ============================================================================
// Event Handlers
// ============================================================================

function handleFilterChange(event: FilterChangeEvent) {
  filteredIds.value = event.filterState.filteredIds;
  hasActiveFilters.value = event.filterState.isFiltered;
}

function handleSelectionChange(event: SelectionChangeEvent) {
  selectedId.value = event.selectedIds[0] ?? null;
}

function handleClearFilters() {
  parallelPlotRef.value?.clearAllFilters();
  parallelPlotRef.value?.clearSolutions();
  hasActiveSolutions.value = false;
}

function handleFilterByRange(rangeName: string) {
  parallelPlotRef.value?.filterByNamedRange(rangeName);
}

function handleOptimize(topN: number) {
  const result = findTopNBySumScore(robots.value, ROBOT_AXES, topN);
  parallelPlotRef.value?.setSolutions(result.solutionIds);
  hasActiveSolutions.value = result.solutionIds.length > 0;
}

function handleRobotSelect(robotId: string) {
  if (selectedId.value === robotId) {
    selectedId.value = null;
  } else {
    selectedId.value = robotId;
  }
}

function handleRegenerateData() {
  robots.value = generateRobots(50);
  filteredIds.value = robots.value.map((r) => r.id);
  selectedId.value = null;
  hasActiveSolutions.value = false;
  parallelPlotRef.value?.clearSolutions();
}
</script>

<template>
  <div class="robot-demo">
    <header class="demo-header">
      <h1>Parallel Plot - Robot Demo</h1>
      <button class="regen-btn" @click="handleRegenerateData">
        Regenerate 50 Robots
      </button>
    </header>

    <div class="chart-section">
      <ChartControls
        :has-active-filters="hasActiveFilters"
        :has-active-solutions="hasActiveSolutions"
        :available-ranges="availableRanges"
        :show-optimization="true"
        :top-n="3"
        @clear-filters="handleClearFilters"
        @filter-by-range="handleFilterByRange"
        @optimize="handleOptimize"
      />

      <div class="chart-container">
        <ParallelPlot
          ref="parallelPlotRef"
          :data="robots"
          :axes="ROBOT_AXES"
          :ranges="axisRanges"
          :external-selection="selectedId"
          @filter-change="handleFilterChange"
          @selection-change="handleSelectionChange"
        />
      </div>
    </div>

    <div class="robots-section">
      <RobotGrid
        :robots="robots"
        :filtered-ids="filteredIds"
        :selected-id="selectedId"
        @select="handleRobotSelect"
      />
    </div>
  </div>
</template>

<style scoped>
.robot-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.demo-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.regen-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.regen-btn:hover {
  background: #2563eb;
}

.chart-section {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.chart-container {
  height: 400px;
  margin-top: 12px;
}

.robots-section {
  /* Robot grid styles in RobotGrid component */
}
</style>
