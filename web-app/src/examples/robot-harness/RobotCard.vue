<script setup lang="ts">
/**
 * RobotCard Component
 *
 * Displays a robot with SVG that visually reflects its attributes:
 * - Speed: wheels vs legs, speed lines
 * - Strength: arm size and fists
 * - Intelligence: brain glow, antenna complexity
 * - Battery: energy bar with lightning bolt
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
// Computed - Attribute-based visuals
// ============================================================================

const speed = computed(() => props.robot.values.speed);
const strength = computed(() => props.robot.values.strength);
const intelligence = computed(() => props.robot.values.intelligence);
const battery = computed(() => props.robot.values.battery);

// Speed: high speed = wheels, low speed = stubby legs
const hasWheels = computed(() => speed.value >= 70);
const legHeight = computed(() => 4 + (speed.value / 100) * 8);

// Strength: affects arm thickness and adds fists for strong robots
const armWidth = computed(() => 4 + (strength.value / 100) * 6);
const armHeight = computed(() => 12 + (strength.value / 100) * 6);
const hasFists = computed(() => strength.value >= 60);

// Intelligence: affects head size and antenna count
const headScale = computed(() => 0.8 + (intelligence.value / 100) * 0.5);
const antennaCount = computed(() => {
  if (intelligence.value >= 80) return 3;
  if (intelligence.value >= 50) return 2;
  return 1;
});
const hasBrainGlow = computed(() => intelligence.value >= 70);

// Battery: color and whether to show lightning bolt
const batteryColor = computed(() => {
  if (battery.value >= 60) return '#22c55e';
  if (battery.value >= 30) return '#f59e0b';
  return '#ef4444';
});
const hasLightning = computed(() => battery.value >= 80);

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
    <svg
      class="robot-icon"
      viewBox="0 0 60 80"
      :style="{ color: robot.color }"
    >
      <defs>
        <!-- Brain glow filter for smart robots -->
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Speed lines for fast robots -->
      <g v-if="speed >= 70" class="speed-lines" opacity="0.4">
        <line x1="2" y1="35" x2="8" y2="35" stroke="currentColor" stroke-width="1.5"/>
        <line x1="0" y1="40" x2="7" y2="40" stroke="currentColor" stroke-width="1.5"/>
        <line x1="2" y1="45" x2="8" y2="45" stroke="currentColor" stroke-width="1.5"/>
      </g>

      <!-- Antenna(s) based on intelligence -->
      <g class="antennae">
        <!-- Center antenna (always present) -->
        <line x1="30" y1="12" x2="30" y2="4" stroke="currentColor" stroke-width="2"/>
        <circle cx="30" cy="3" r="2.5" fill="currentColor"/>

        <!-- Side antennas for smart robots -->
        <g v-if="antennaCount >= 2">
          <line x1="22" y1="14" x2="18" y2="6" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="17" cy="5" r="2" fill="currentColor"/>
          <line x1="38" y1="14" x2="42" y2="6" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="43" cy="5" r="2" fill="currentColor"/>
        </g>

        <!-- Extra antenna nodes for genius robots -->
        <g v-if="antennaCount >= 3">
          <circle cx="30" cy="0" r="1.5" fill="currentColor"/>
          <line x1="30" y1="3" x2="30" y2="1" stroke="currentColor" stroke-width="1"/>
        </g>
      </g>

      <!-- Head (scales with intelligence) -->
      <g :transform="`translate(30, 22) scale(${headScale})`">
        <rect
          x="-12"
          y="-10"
          width="24"
          height="18"
          rx="4"
          fill="currentColor"
          :filter="hasBrainGlow ? 'url(#glow)' : ''"
        />
        <!-- Eyes -->
        <circle cx="-5" cy="-2" r="3" fill="white"/>
        <circle cx="5" cy="-2" r="3" fill="white"/>
        <circle cx="-5" cy="-2" r="1.5" fill="#333"/>
        <circle cx="5" cy="-2" r="1.5" fill="#333"/>

        <!-- Mouth/display -->
        <rect x="-6" y="3" width="12" height="3" rx="1" fill="#333" opacity="0.5"/>
      </g>

      <!-- Body -->
      <rect x="15" y="32" width="30" height="26" rx="4" fill="currentColor"/>

      <!-- Battery indicator -->
      <rect x="19" y="36" width="22" height="10" rx="2" fill="#333" opacity="0.3"/>
      <rect
        x="19"
        y="36"
        :width="22 * (battery / 100)"
        height="10"
        rx="2"
        :fill="batteryColor"
      />

      <!-- Lightning bolt for high battery -->
      <g v-if="hasLightning">
        <polygon
          points="28,38 32,38 30,42 34,42 27,48 29,44 26,44"
          fill="#fbbf24"
          stroke="#f59e0b"
          stroke-width="0.5"
        />
      </g>

      <!-- Chest detail -->
      <circle cx="30" cy="52" r="3" fill="#333" opacity="0.3"/>

      <!-- Arms (size based on strength) -->
      <g class="arms">
        <!-- Left arm -->
        <rect
          :x="15 - armWidth"
          y="34"
          :width="armWidth"
          :height="armHeight"
          rx="2"
          fill="currentColor"
        />
        <!-- Left fist -->
        <circle
          v-if="hasFists"
          :cx="15 - armWidth/2"
          :cy="34 + armHeight + 3"
          :r="armWidth/2 + 1"
          fill="currentColor"
        />

        <!-- Right arm -->
        <rect
          x="45"
          y="34"
          :width="armWidth"
          :height="armHeight"
          rx="2"
          fill="currentColor"
        />
        <!-- Right fist -->
        <circle
          v-if="hasFists"
          :cx="45 + armWidth/2"
          :cy="34 + armHeight + 3"
          :r="armWidth/2 + 1"
          fill="currentColor"
        />
      </g>

      <!-- Legs/Wheels based on speed -->
      <g v-if="hasWheels" class="wheels">
        <!-- Left wheel -->
        <circle cx="22" cy="64" r="6" fill="#333"/>
        <circle cx="22" cy="64" r="4" fill="currentColor"/>
        <circle cx="22" cy="64" r="1.5" fill="#333"/>

        <!-- Right wheel -->
        <circle cx="38" cy="64" r="6" fill="#333"/>
        <circle cx="38" cy="64" r="4" fill="currentColor"/>
        <circle cx="38" cy="64" r="1.5" fill="#333"/>

        <!-- Axle -->
        <rect x="22" y="62" width="16" height="4" fill="#555"/>
      </g>

      <g v-else class="legs">
        <!-- Left leg -->
        <rect
          x="20"
          y="58"
          width="8"
          :height="legHeight"
          rx="2"
          fill="currentColor"
        />
        <ellipse cx="24" :cy="58 + legHeight + 2" rx="5" ry="2.5" fill="currentColor"/>

        <!-- Right leg -->
        <rect
          x="32"
          y="58"
          width="8"
          :height="legHeight"
          rx="2"
          fill="currentColor"
        />
        <ellipse cx="36" :cy="58 + legHeight + 2" rx="5" ry="2.5" fill="currentColor"/>
      </g>
    </svg>

    <span class="robot-label">{{ robot.label }}</span>

    <!-- Mini stat indicators -->
    <div class="stat-icons">
      <span class="stat" :title="`Speed: ${speed}`">⚡{{ speed >= 70 ? '++' : speed >= 40 ? '+' : '' }}</span>
      <span class="stat" :title="`Strength: ${strength}`">💪{{ strength >= 70 ? '++' : strength >= 40 ? '+' : '' }}</span>
      <span class="stat" :title="`Intelligence: ${intelligence}`">🧠{{ intelligence >= 70 ? '++' : intelligence >= 40 ? '+' : '' }}</span>
      <span class="stat" :title="`Battery: ${battery}`">🔋{{ battery >= 70 ? '++' : battery >= 40 ? '+' : '' }}</span>
    </div>
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
  min-width: 80px;
}

.robot-card:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.robot-card--selected {
  background: #ede9fe;
  border-color: #8b5cf6;
}

.robot-card--filtered {
  opacity: 0.25;
}

.robot-icon {
  width: 60px;
  height: 80px;
  margin-bottom: 4px;
}

.robot-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
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
