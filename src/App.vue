<!-- src/App.vue -->
<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import 'element-plus/dist/index.css';
import './style.css';
</script>