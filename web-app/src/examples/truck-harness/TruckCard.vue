<script setup lang="ts">
/**
 * TruckCard Component
 *
 * Displays a truck with SVG reflecting attributes:
 * - Horsepower: engine size/exhaust
 * - Capacity: cargo bed size
 * - Efficiency: leaf icon for eco
 * - Reliability: condition indicator
 */

import { computed } from 'vue';
import type { Truck } from './types';

export interface Props {
  truck: Truck;
  isFiltered?: boolean;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isFiltered: true,
  isSelected: false,
});

const emit = defineEmits<{
  select: [truckId: string];
}>();

// Normalized values (0-1)
const hp = computed(() => props.truck.values.horsepower / 500);
const capacity = computed(() => props.truck.values.capacity / 50);
const efficiency = computed(() => props.truck.values.efficiency / 30);
const reliability = computed(() => props.truck.values.reliability / 100);

// Visual properties
const cabHeight = computed(() => 14 + hp.value * 6);
const bedLength = computed(() => 20 + capacity.value * 15);
const hasExhaust = computed(() => hp.value >= 0.7);
const isEco = computed(() => efficiency.value >= 0.6);
const wheelSize = computed(() => 6 + capacity.value * 3);

// Reliability affects rust/condition
const condition = computed(() => {
  if (reliability.value >= 0.8) return 'excellent';
  if (reliability.value >= 0.5) return 'good';
  return 'worn';
});

function handleClick() {
  emit('select', props.truck.id);
}
</script>

<template>
  <div
    class="truck-card"
    :class="{
      'truck-card--filtered': !isFiltered,
      'truck-card--selected': isSelected,
    }"
    @click="handleClick"
  >
    <svg
      class="truck-icon"
      viewBox="0 0 80 50"
      :style="{ color: truck.color }"
    >
      <!-- Exhaust smoke for powerful trucks -->
      <g v-if="hasExhaust" class="exhaust" opacity="0.3">
        <circle cx="12" cy="8" r="3" fill="#666"/>
        <circle cx="8" cy="5" r="2.5" fill="#888"/>
        <circle cx="14" cy="4" r="2" fill="#999"/>
      </g>

      <!-- Cab -->
      <rect
        x="5"
        :y="30 - cabHeight"
        width="18"
        :height="cabHeight"
        rx="3"
        fill="currentColor"
        :opacity="condition === 'worn' ? 0.7 : 1"
      />

      <!-- Windshield -->
      <rect
        x="8"
        :y="32 - cabHeight"
        width="12"
        height="8"
        rx="1"
        fill="#87CEEB"
        opacity="0.8"
      />

      <!-- Engine hood -->
      <rect
        x="5"
        y="28"
        width="18"
        height="6"
        rx="1"
        fill="currentColor"
        :opacity="condition === 'worn' ? 0.6 : 0.9"
      />

      <!-- Exhaust pipe for powerful trucks -->
      <rect v-if="hasExhaust" x="10" y="12" width="3" height="8" fill="#444" rx="1"/>

      <!-- Cargo bed -->
      <rect
        x="23"
        y="20"
        :width="bedLength"
        height="14"
        fill="currentColor"
        :opacity="condition === 'worn' ? 0.6 : 0.85"
      />

      <!-- Cargo bed rails -->
      <rect :x="23" y="18" :width="bedLength" height="3" fill="currentColor"/>
      <rect :x="22 + bedLength" y="18" width="3" height="16" fill="currentColor"/>

      <!-- Cargo indicators (boxes) based on capacity -->
      <g v-if="capacity >= 0.3">
        <rect x="26" y="23" width="6" height="6" fill="#8B4513" opacity="0.6" rx="1"/>
      </g>
      <g v-if="capacity >= 0.5">
        <rect x="34" y="22" width="8" height="8" fill="#8B4513" opacity="0.5" rx="1"/>
      </g>
      <g v-if="capacity >= 0.7">
        <rect x="44" y="24" width="5" height="5" fill="#8B4513" opacity="0.4" rx="1"/>
      </g>

      <!-- Eco leaf for efficient trucks -->
      <g v-if="isEco" transform="translate(60, 8)">
        <ellipse cx="0" cy="0" rx="5" ry="3" fill="#22c55e" transform="rotate(-30)"/>
        <line x1="0" y1="0" x2="0" y2="6" stroke="#22c55e" stroke-width="1.5"/>
      </g>

      <!-- Chassis -->
      <rect x="3" y="34" :width="22 + bedLength" height="4" fill="#333" rx="1"/>

      <!-- Wheels -->
      <g class="wheels">
        <!-- Front wheel -->
        <circle cx="14" cy="40" :r="wheelSize" fill="#222"/>
        <circle cx="14" cy="40" :r="wheelSize - 2" fill="#444"/>
        <circle cx="14" cy="40" r="2" fill="#666"/>

        <!-- Rear wheels (dual for big capacity) -->
        <circle :cx="28 + bedLength/2" cy="40" :r="wheelSize" fill="#222"/>
        <circle :cx="28 + bedLength/2" cy="40" :r="wheelSize - 2" fill="#444"/>
        <circle :cx="28 + bedLength/2" cy="40" r="2" fill="#666"/>

        <g v-if="capacity >= 0.6">
          <circle :cx="20 + bedLength/2" cy="40" :r="wheelSize" fill="#222"/>
          <circle :cx="20 + bedLength/2" cy="40" :r="wheelSize - 2" fill="#444"/>
        </g>
      </g>

      <!-- Headlight -->
      <circle cx="6" cy="30" r="2" fill="#fbbf24"/>

      <!-- Condition indicator -->
      <g v-if="condition === 'worn'" opacity="0.4">
        <line x1="25" y1="22" x2="28" y2="25" stroke="#8B4513" stroke-width="1"/>
        <line x1="35" y1="28" x2="38" y2="31" stroke="#8B4513" stroke-width="1"/>
      </g>

      <!-- Star for excellent condition -->
      <g v-if="condition === 'excellent'" transform="translate(70, 12)">
        <polygon points="0,-5 1.5,-1.5 5,-1.5 2.5,1 3.5,5 0,2.5 -3.5,5 -2.5,1 -5,-1.5 -1.5,-1.5" fill="#fbbf24"/>
      </g>
    </svg>

    <span class="truck-label">{{ truck.label }}</span>

    <div class="stat-icons">
      <span class="stat" :title="`HP: ${truck.values.horsepower}`">🔥{{ hp >= 0.7 ? '++' : hp >= 0.4 ? '+' : '' }}</span>
      <span class="stat" :title="`Capacity: ${truck.values.capacity}t`">📦{{ capacity >= 0.7 ? '++' : capacity >= 0.4 ? '+' : '' }}</span>
      <span class="stat" :title="`MPG: ${truck.values.efficiency}`">⛽{{ efficiency >= 0.7 ? '++' : efficiency >= 0.4 ? '+' : '' }}</span>
      <span class="stat" :title="`Reliability: ${truck.values.reliability}%`">⭐{{ reliability >= 0.7 ? '++' : reliability >= 0.4 ? '+' : '' }}</span>
    </div>
  </div>
</template>

<style scoped>
.truck-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #f9fafb;
  min-width: 90px;
}

.truck-card:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.truck-card--selected {
  background: #dbeafe;
  border-color: #3b82f6;
}

.truck-card--filtered {
  opacity: 0.25;
}

.truck-icon {
  width: 80px;
  height: 50px;
  margin-bottom: 4px;
}

.truck-label {
  font-size: 10px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-icons {
  display: flex;
  gap: 1px;
  font-size: 8px;
  opacity: 0.7;
}

.stat {
  cursor: help;
}
</style>
