<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="card in cards" :key="card.id" :title="card.title" :value="card.value" :description="card.description" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from '../components/Card.vue';

const cards = ref([
  { id: 1, title: 'Total Sales', value: '$10,000', description: 'Last 30 days' },
  { id: 2, title: 'Customers', value: '150', description: 'Active users' },
  { id: 3, title: 'Products', value: '50', description: 'In stock' },
]);
</script>
