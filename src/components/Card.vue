<template>
  <el-card class="card hover:shadow-lg transition-shadow duration-300">
    <div class="p-6">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <p class="text-3xl font-bold mt-2 text-blue-600">{{ value }}</p>
      <p class="text-sm text-gray-500">{{ description }}</p>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{ title: string; value: string | number; description: string }>();
</script>

<style scoped>
.card {
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
</style>
