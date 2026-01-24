<script setup lang="ts">
import { RobotDemo } from './examples/robot-harness';
</script>

<template>
  <RobotDemo />
</template>

<style>
/* Global styles for the demo */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background: #f3f4f6;
  min-height: 100vh;
}

#app {
  padding: 20px;
}
</style>
