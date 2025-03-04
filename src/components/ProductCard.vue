<!-- src/components/ProductCard.vue -->
<template>
    <el-card class="shadow-md hover:shadow-lg transition-shadow" style="max-width: 300px;">
      <template #header>
        <span>{{ product.name }}</span>
      </template>
      <div class="p-4">
        <p><strong>Price:</strong> ${{ product.price }}</p>
        <p><strong>Category:</strong> {{ product.category }}</p>
        <el-button type="text" @click="$emit('view-details', product.id)">View Details</el-button>
      </div>
    </el-card>
  </template>
  
  <script setup lang="ts">
  import { Product } from '../types/product/productTypes';
  defineProps<{ product: Product }>();
  defineEmits<{ (e: 'view-details', productId: number): void }>();
  import { ElCard, ElButton } from 'element-plus';
  </script>