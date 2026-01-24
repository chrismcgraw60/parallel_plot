<script setup lang="ts">
/**
 * CreatureCard Component
 *
 * Displays mythical creatures with species-specific SVG:
 * - Magic: aura/sparkles intensity
 * - Ferocity: expression, flames, claws
 * - Speed: wings/motion lines
 * - Rarity: crown/stars
 */

import { computed } from 'vue';
import type { Creature } from './types';

export interface Props {
  creature: Creature;
  isFiltered?: boolean;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isFiltered: true,
  isSelected: false,
});

const emit = defineEmits<{
  select: [creatureId: string];
}>();

// Normalized values (0-1)
const magic = computed(() => props.creature.values.magic / 100);
const ferocity = computed(() => props.creature.values.ferocity / 100);
const speed = computed(() => props.creature.values.speed / 100);
const rarity = computed(() => props.creature.values.rarity / 100);

// Visual properties
const hasAura = computed(() => magic.value >= 0.6);
const hasSparkles = computed(() => magic.value >= 0.4);
const isAngry = computed(() => ferocity.value >= 0.6);
const hasFlames = computed(() => ferocity.value >= 0.8 && ['dragon', 'phoenix'].includes(props.creature.species));
const hasSpeedLines = computed(() => speed.value >= 0.7);
const isLegendary = computed(() => rarity.value >= 0.85);
const isRare = computed(() => rarity.value >= 0.6);

const species = computed(() => props.creature.species);

function handleClick() {
  emit('select', props.creature.id);
}
</script>

<template>
  <div
    class="creature-card"
    :class="{
      'creature-card--filtered': !isFiltered,
      'creature-card--selected': isSelected,
      'creature-card--legendary': isLegendary,
    }"
    @click="handleClick"
  >
    <svg
      class="creature-icon"
      viewBox="0 0 60 60"
      :style="{ color: creature.color }"
    >
      <defs>
        <filter id="creature-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="fire-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:#dc2626"/>
          <stop offset="50%" style="stop-color:#f97316"/>
          <stop offset="100%" style="stop-color:#fbbf24"/>
        </linearGradient>
      </defs>

      <!-- Magic aura -->
      <circle
        v-if="hasAura"
        cx="30"
        cy="32"
        :r="20 + magic * 8"
        fill="currentColor"
        :opacity="0.15 + magic * 0.1"
        :filter="'url(#creature-glow)'"
      />

      <!-- Sparkles for magical creatures -->
      <g v-if="hasSparkles" class="sparkles">
        <circle cx="15" cy="15" r="1.5" fill="#fbbf24" opacity="0.8"/>
        <circle cx="45" cy="12" r="1" fill="#fbbf24" opacity="0.6"/>
        <circle cx="50" cy="25" r="1.5" fill="#fbbf24" opacity="0.7"/>
        <circle cx="10" cy="35" r="1" fill="#fbbf24" opacity="0.5"/>
        <circle v-if="magic >= 0.7" cx="48" cy="40" r="1.5" fill="#fbbf24" opacity="0.8"/>
      </g>

      <!-- Speed lines -->
      <g v-if="hasSpeedLines" class="speed-lines" opacity="0.3">
        <line x1="2" y1="28" x2="10" y2="28" stroke="currentColor" stroke-width="1.5"/>
        <line x1="0" y1="33" x2="8" y2="33" stroke="currentColor" stroke-width="1.5"/>
        <line x1="2" y1="38" x2="10" y2="38" stroke="currentColor" stroke-width="1.5"/>
      </g>

      <!-- DRAGON -->
      <g v-if="species === 'dragon'" class="dragon">
        <!-- Wings -->
        <path d="M15,25 Q5,15 10,35 Q15,30 15,25" fill="currentColor" opacity="0.8"/>
        <path d="M45,25 Q55,15 50,35 Q45,30 45,25" fill="currentColor" opacity="0.8"/>
        <!-- Body -->
        <ellipse cx="30" cy="35" rx="12" ry="10" fill="currentColor"/>
        <!-- Head -->
        <circle cx="30" cy="22" r="8" fill="currentColor"/>
        <!-- Horns -->
        <path d="M24,16 L22,8 L26,14" fill="currentColor"/>
        <path d="M36,16 L38,8 L34,14" fill="currentColor"/>
        <!-- Eyes -->
        <circle cx="27" cy="21" r="2" fill="white"/>
        <circle cx="33" cy="21" r="2" fill="white"/>
        <circle cx="27" cy="21" r="1" :fill="isAngry ? '#dc2626' : '#333'"/>
        <circle cx="33" cy="21" r="1" :fill="isAngry ? '#dc2626' : '#333'"/>
        <!-- Fire breath -->
        <g v-if="hasFlames">
          <ellipse cx="30" cy="8" rx="4" ry="6" fill="url(#fire-gradient)" opacity="0.9"/>
          <ellipse cx="28" cy="6" rx="2" ry="4" fill="#fbbf24"/>
        </g>
        <!-- Tail -->
        <path d="M30,45 Q40,50 45,45 Q48,42 50,44" stroke="currentColor" stroke-width="3" fill="none"/>
        <!-- Claws -->
        <g v-if="isAngry">
          <line x1="22" y1="42" x2="18" y2="48" stroke="currentColor" stroke-width="2"/>
          <line x1="38" y1="42" x2="42" y2="48" stroke="currentColor" stroke-width="2"/>
        </g>
      </g>

      <!-- UNICORN -->
      <g v-if="species === 'unicorn'" class="unicorn">
        <!-- Body -->
        <ellipse cx="32" cy="38" rx="14" ry="8" fill="currentColor"/>
        <!-- Legs -->
        <rect x="22" y="44" width="3" height="10" fill="currentColor" rx="1"/>
        <rect x="28" y="44" width="3" height="10" fill="currentColor" rx="1"/>
        <rect x="36" y="44" width="3" height="10" fill="currentColor" rx="1"/>
        <rect x="42" y="44" width="3" height="10" fill="currentColor" rx="1"/>
        <!-- Neck & Head -->
        <path d="M22,35 Q18,25 22,18" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="20" cy="16" r="6" fill="currentColor"/>
        <!-- Horn (glows with magic) -->
        <polygon points="20,10 18,2 22,2" :fill="hasAura ? '#fbbf24' : '#fff'" :filter="hasAura ? 'url(#creature-glow)' : ''"/>
        <!-- Eye -->
        <circle cx="18" cy="15" r="1.5" fill="white"/>
        <circle cx="18" cy="15" r="0.8" fill="#333"/>
        <!-- Mane -->
        <path d="M22,12 Q28,15 24,22 Q30,20 26,28" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
        <!-- Tail -->
        <path d="M46,38 Q52,35 50,42 Q55,40 52,48" stroke="currentColor" stroke-width="2" fill="none" opacity="0.7"/>
      </g>

      <!-- PHOENIX -->
      <g v-if="species === 'phoenix'" class="phoenix">
        <!-- Flame tail -->
        <path d="M10,35 Q5,45 15,50 Q10,40 20,45 Q15,38 10,35" fill="url(#fire-gradient)" opacity="0.8"/>
        <!-- Wings -->
        <path d="M25,30 Q15,20 20,35" fill="currentColor"/>
        <path d="M35,30 Q45,20 40,35" fill="currentColor"/>
        <!-- Body -->
        <ellipse cx="30" cy="35" rx="8" ry="6" fill="currentColor"/>
        <!-- Head -->
        <circle cx="30" cy="25" r="6" fill="currentColor"/>
        <!-- Crest -->
        <path d="M28,20 Q30,12 32,20" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <circle cx="30" cy="12" r="2" fill="#fbbf24"/>
        <!-- Eyes -->
        <circle cx="28" cy="24" r="1.5" fill="white"/>
        <circle cx="32" cy="24" r="1.5" fill="white"/>
        <circle cx="28" cy="24" r="0.7" fill="#333"/>
        <circle cx="32" cy="24" r="0.7" fill="#333"/>
        <!-- Beak -->
        <polygon points="30,27 28,30 32,30" fill="#f97316"/>
        <!-- Fire aura -->
        <g v-if="hasFlames">
          <ellipse cx="30" cy="35" rx="12" ry="10" fill="url(#fire-gradient)" opacity="0.3"/>
        </g>
      </g>

      <!-- GRIFFIN -->
      <g v-if="species === 'griffin'" class="griffin">
        <!-- Wings -->
        <path d="M18,28 Q8,18 12,35 Q18,30 18,28" fill="currentColor" opacity="0.8"/>
        <path d="M42,28 Q52,18 48,35 Q42,30 42,28" fill="currentColor" opacity="0.8"/>
        <!-- Lion body -->
        <ellipse cx="32" cy="40" rx="12" ry="8" fill="currentColor"/>
        <!-- Back legs -->
        <rect x="38" y="46" width="4" height="8" fill="currentColor" rx="1"/>
        <rect x="44" y="46" width="4" height="8" fill="currentColor" rx="1"/>
        <!-- Front legs (eagle talons) -->
        <rect x="20" y="44" width="3" height="8" fill="#a16207" rx="1"/>
        <rect x="26" y="44" width="3" height="8" fill="#a16207" rx="1"/>
        <!-- Eagle head -->
        <circle cx="22" cy="28" r="7" fill="#a16207"/>
        <!-- Beak -->
        <polygon points="16,28 12,30 16,32" fill="#f59e0b"/>
        <!-- Eye -->
        <circle cx="20" cy="27" r="2" fill="white"/>
        <circle cx="20" cy="27" r="1" :fill="isAngry ? '#dc2626' : '#333'"/>
        <!-- Tail (lion) -->
        <path d="M44,40 Q52,38 50,45" stroke="currentColor" stroke-width="3" fill="none"/>
        <circle cx="51" cy="45" r="3" fill="currentColor"/>
      </g>

      <!-- KRAKEN -->
      <g v-if="species === 'kraken'" class="kraken">
        <!-- Tentacles -->
        <path d="M15,40 Q10,50 5,48 Q8,55 15,52" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M20,42 Q18,52 12,55" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M40,42 Q42,52 48,55" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M45,40 Q50,50 55,48 Q52,55 45,52" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M25,44 Q25,54 22,58" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M35,44 Q35,54 38,58" stroke="currentColor" stroke-width="2" fill="none"/>
        <!-- Body -->
        <ellipse cx="30" cy="32" rx="15" ry="12" fill="currentColor"/>
        <!-- Eyes -->
        <circle cx="25" cy="30" r="4" fill="#fbbf24"/>
        <circle cx="35" cy="30" r="4" fill="#fbbf24"/>
        <circle cx="25" cy="30" r="2" :fill="isAngry ? '#dc2626' : '#333'"/>
        <circle cx="35" cy="30" r="2" :fill="isAngry ? '#dc2626' : '#333'"/>
        <!-- Angry brow -->
        <g v-if="isAngry">
          <line x1="21" y1="25" x2="28" y2="27" stroke="#0891b2" stroke-width="2"/>
          <line x1="39" y1="25" x2="32" y2="27" stroke="#0891b2" stroke-width="2"/>
        </g>
      </g>

      <!-- FAIRY -->
      <g v-if="species === 'fairy'" class="fairy">
        <!-- Wings -->
        <ellipse cx="22" cy="30" rx="8" ry="12" fill="currentColor" opacity="0.5" :filter="hasAura ? 'url(#creature-glow)' : ''"/>
        <ellipse cx="38" cy="30" rx="8" ry="12" fill="currentColor" opacity="0.5" :filter="hasAura ? 'url(#creature-glow)' : ''"/>
        <ellipse cx="20" cy="35" rx="5" ry="8" fill="currentColor" opacity="0.3"/>
        <ellipse cx="40" cy="35" rx="5" ry="8" fill="currentColor" opacity="0.3"/>
        <!-- Body -->
        <ellipse cx="30" cy="38" rx="4" ry="6" fill="currentColor"/>
        <!-- Head -->
        <circle cx="30" cy="28" r="5" fill="#fde68a"/>
        <!-- Hair -->
        <path d="M25,26 Q28,20 30,26 Q32,20 35,26" fill="currentColor"/>
        <!-- Eyes -->
        <circle cx="28" cy="28" r="1.2" fill="#333"/>
        <circle cx="32" cy="28" r="1.2" fill="#333"/>
        <!-- Smile -->
        <path d="M28,31 Q30,33 32,31" stroke="#333" stroke-width="0.8" fill="none"/>
        <!-- Wand -->
        <line x1="36" y1="35" x2="45" y2="28" stroke="#fbbf24" stroke-width="1.5"/>
        <circle cx="46" cy="27" r="2" fill="#fbbf24" :filter="'url(#creature-glow)'"/>
      </g>

      <!-- Legendary crown/stars -->
      <g v-if="isLegendary" class="legendary">
        <polygon points="30,2 28,7 32,7" fill="#fbbf24"/>
        <polygon points="24,5 23,9 26,8" fill="#fbbf24"/>
        <polygon points="36,5 37,9 34,8" fill="#fbbf24"/>
      </g>
      <g v-else-if="isRare" class="rare">
        <polygon points="30,5 29,8 31,8" fill="#c084fc"/>
      </g>
    </svg>

    <span class="creature-label">{{ creature.label }}</span>

    <div class="stat-icons">
      <span class="stat" :title="`Magic: ${creature.values.magic}`">✨{{ magic >= 0.7 ? '++' : magic >= 0.4 ? '+' : '' }}</span>
      <span class="stat" :title="`Ferocity: ${creature.values.ferocity}`">😈{{ ferocity >= 0.7 ? '++' : ferocity >= 0.4 ? '+' : '' }}</span>
      <span class="stat" :title="`Speed: ${creature.values.speed}`">💨{{ speed >= 0.7 ? '++' : speed >= 0.4 ? '+' : '' }}</span>
      <span class="stat" :title="`Rarity: ${creature.values.rarity}`">💎{{ rarity >= 0.7 ? '++' : rarity >= 0.4 ? '+' : '' }}</span>
    </div>
  </div>
</template>

<style scoped>
.creature-card {
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

.creature-card:hover {
  background: #faf5ff;
  border-color: #d8b4fe;
  transform: translateY(-2px);
}

.creature-card--selected {
  background: #faf5ff;
  border-color: #a855f7;
}

.creature-card--filtered {
  opacity: 0.25;
}

.creature-card--legendary {
  background: linear-gradient(135deg, #fef3c7 0%, #faf5ff 100%);
}

.creature-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 4px;
}

.creature-label {
  font-size: 9px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
  text-align: center;
  max-width: 75px;
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
