<script setup lang="ts">
/**
 * DomainDemo Component
 *
 * Demonstrates the ParallelPlot with switchable domains (Robots, Trucks, etc.)
 */

import { ref, computed, watch } from 'vue';
import { ParallelPlot } from '../components/parallel-plot';
import ChartControls from '../components/parallel-plot/components/ChartControls.vue';
import { findTopNBySumScore } from '../components/parallel-plot/utils/optimization';
import type { FilterChangeEvent, DomainObject, AxisConfig, AxisRanges } from '../components/parallel-plot/types';

// Robot domain
import { ROBOT_AXES, createRobotAxisRanges } from './robot-harness/types';
import { SAMPLE_ROBOTS, generateRobots } from './robot-harness/data';
import RobotCard from './robot-harness/RobotCard.vue';

// Truck domain
import { TRUCK_AXES, createTruckAxisRanges } from './truck-harness/types';
import { SAMPLE_TRUCKS, generateTrucks } from './truck-harness/data';
import TruckCard from './truck-harness/TruckCard.vue';

// Creature domain
import { CREATURE_AXES, createCreatureAxisRanges } from './creature-harness/types';
import { SAMPLE_CREATURES, generateCreatures } from './creature-harness/data';
import CreatureCard from './creature-harness/CreatureCard.vue';

// ============================================================================
// Domain Configuration
// ============================================================================

type DomainType = 'robots' | 'trucks' | 'creatures';

interface DomainConfig {
  label: string;
  axes: AxisConfig[];
  ranges: AxisRanges[];
  sampleData: DomainObject[];
  generateData: (count: number) => DomainObject[];
  availableRanges: string[];
}

const domainConfigs: Record<DomainType, DomainConfig> = {
  robots: {
    label: 'Robots',
    axes: ROBOT_AXES,
    ranges: createRobotAxisRanges(),
    sampleData: SAMPLE_ROBOTS,
    generateData: generateRobots,
    availableRanges: ['green', 'amber', 'red'],
  },
  trucks: {
    label: 'Trucks',
    axes: TRUCK_AXES,
    ranges: createTruckAxisRanges(),
    sampleData: SAMPLE_TRUCKS,
    generateData: generateTrucks,
    availableRanges: ['green', 'amber', 'red'],
  },
  creatures: {
    label: 'Creatures',
    axes: CREATURE_AXES,
    ranges: createCreatureAxisRanges(),
    sampleData: SAMPLE_CREATURES,
    generateData: generateCreatures,
    availableRanges: ['green', 'amber', 'red'],
  },
};

// ============================================================================
// State
// ============================================================================

const selectedDomain = ref<DomainType>('robots');
const currentConfig = computed(() => domainConfigs[selectedDomain.value]);

const data = ref<DomainObject[]>([...domainConfigs.robots.sampleData]);
const parallelPlotRef = ref<InstanceType<typeof ParallelPlot> | null>(null);
const filteredIds = ref<string[]>(data.value.map((d) => d.id));
const selectedId = ref<string | null>(null);
const hasActiveFilters = ref(false);
const hasActiveSolutions = ref(false);

// ============================================================================
// Domain Switching
// ============================================================================

watch(selectedDomain, (newDomain) => {
  const config = domainConfigs[newDomain];
  data.value = [...config.sampleData];
  filteredIds.value = data.value.map((d) => d.id);
  selectedId.value = null;
  hasActiveFilters.value = false;
  hasActiveSolutions.value = false;
});

// ============================================================================
// Event Handlers
// ============================================================================

function handleFilterChange(event: FilterChangeEvent) {
  filteredIds.value = event.filterState.filteredIds;
  hasActiveFilters.value = event.filterState.isFiltered;
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
  const result = findTopNBySumScore(data.value, currentConfig.value.axes, topN);
  parallelPlotRef.value?.setSolutions(result.solutionIds);
  hasActiveSolutions.value = result.solutionIds.length > 0;
}

function handleItemSelect(itemId: string) {
  selectedId.value = selectedId.value === itemId ? null : itemId;
}

function handleRegenerateData() {
  data.value = currentConfig.value.generateData(30);
  filteredIds.value = data.value.map((d) => d.id);
  selectedId.value = null;
  hasActiveSolutions.value = false;
  parallelPlotRef.value?.clearSolutions();
}

// Computed for grid filtering
const filteredIdSet = computed(() => new Set(filteredIds.value));
</script>

<template>
  <div class="domain-demo">
    <header class="demo-header">
      <div class="header-left">
        <h1>Parallel Plot Demo</h1>
        <select v-model="selectedDomain" class="domain-select">
          <option value="robots">🤖 Robots</option>
          <option value="trucks">🚚 Trucks</option>
          <option value="creatures">🐉 Creatures</option>
        </select>
      </div>
      <button class="regen-btn" @click="handleRegenerateData">
        Regenerate 30 {{ currentConfig.label }}
      </button>
    </header>

    <div class="chart-section">
      <ChartControls
        :has-active-filters="hasActiveFilters"
        :has-active-solutions="hasActiveSolutions"
        :available-ranges="currentConfig.availableRanges"
        :show-optimization="true"
        :top-n="3"
        @clear-filters="handleClearFilters"
        @filter-by-range="handleFilterByRange"
        @optimize="handleOptimize"
      />

      <div class="chart-container">
        <ParallelPlot
          ref="parallelPlotRef"
          :data="data"
          :axes="currentConfig.axes"
          :ranges="currentConfig.ranges"
          :external-selection="selectedId"
          @filter-change="handleFilterChange"
        />
      </div>
    </div>

    <div class="items-section">
      <h3 class="items-header">
        Filtered {{ currentConfig.label }} ({{ filteredIds.length }})
      </h3>

      <div class="items-grid">
        <!-- Robot cards -->
        <template v-if="selectedDomain === 'robots'">
          <RobotCard
            v-for="item in data"
            :key="item.id"
            :robot="item as any"
            :is-filtered="filteredIdSet.has(item.id)"
            :is-selected="selectedId === item.id"
            @select="handleItemSelect"
          />
        </template>

        <!-- Truck cards -->
        <template v-else-if="selectedDomain === 'trucks'">
          <TruckCard
            v-for="item in data"
            :key="item.id"
            :truck="item as any"
            :is-filtered="filteredIdSet.has(item.id)"
            :is-selected="selectedId === item.id"
            @select="handleItemSelect"
          />
        </template>

        <!-- Creature cards -->
        <template v-else-if="selectedDomain === 'creatures'">
          <CreatureCard
            v-for="item in data"
            :key="item.id"
            :creature="item as any"
            :is-filtered="filteredIdSet.has(item.id)"
            :is-selected="selectedId === item.id"
            @select="handleItemSelect"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.domain-demo {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.demo-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.domain-select {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.domain-select:hover {
  border-color: #9ca3af;
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

.items-section {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.items-header {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
}
</style>
