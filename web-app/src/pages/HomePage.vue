<script setup lang="ts">
import { RouterLink } from 'vue-router'

const demos = [
  {
    name: 'Parallel Plot',
    path: '/plot',
    description: 'Interactive parallel coordinates chart with filtering, selection, and optimization features. Visualize multi-dimensional data across domain objects.',
  },
]
</script>

<template>
  <div class="home">
    <header class="header">
      <h1>Component Demos</h1>
      <p class="subtitle">Explore interactive Vue3/D3 visualization components</p>
    </header>

    <div class="demos-grid">
      <RouterLink
        v-for="demo in demos"
        :key="demo.path"
        :to="demo.path"
        class="demo-card"
      >
        <h2>{{ demo.name }}</h2>
        <p>{{ demo.description }}</p>
        <span class="link-arrow">View Demo &rarr;</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 48px;
}

.header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.demos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.demo-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.demo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.demo-card h2 {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.demo-card p {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.link-arrow {
  color: #3b82f6;
  font-weight: 500;
  font-size: 0.9rem;
}
</style>
