<template>
  <el-form ref="productFormRef" :model="product" :rules="rules" label-width="120px">
    <el-form-item label="Barcode" prop="barcode">
      <el-input v-model="product.barcode" placeholder="Enter barcode" />
    </el-form-item>

    <el-form-item label="Product Name" prop="name">
      <el-input v-model="product.name" placeholder="Enter product name" />
    </el-form-item>

    <el-form-item label="Description">
      <el-input v-model="product.descriptions" type="textarea" placeholder="Enter product description" />
    </el-form-item>

    <el-form-item label="Unit Price" prop="unitPrice">
      <el-input-number v-model="product.unitPrice" :min="0" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">{{ isEditMode ? 'Update' : 'Save' }}</el-button>
      <el-button @click="resetForm">Reset</el-button>
      <el-button @click="emit('cancel')">Cancel</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch } from 'vue';
import type { Product } from '../types/product/productTypes';

const props = defineProps<{ modelValue: Product | null }>();
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const defaultProduct: Product = {
  itemId: '',
  barcode: '',
  name: '',
  descriptions: '',
  unitPrice: 0,
};

const productFormRef = ref(); // 🔥 This is needed to reset the form properly
const product = ref<Product>({ ...defaultProduct });

watch(
  () => props.modelValue,
  (newValue) => {
    product.value = newValue ? { ...newValue } : { ...defaultProduct }; // Reset or use existing product
  },
  { immediate: true }
);

const rules = {
  barcode: [{ required: true, message: 'Barcode is required', trigger: 'blur' }],
  name: [{ required: true, message: 'Product name is required', trigger: 'blur' }],
  unitPrice: [{ required: true, message: 'Price is required', trigger: 'blur' }],
};

const isEditMode = computed(() => !!product.value.itemId);

const submitForm = () => {
  productFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      emit('submit', product.value);
      resetForm(); // 🔥 Reset form after successful submission
    }
  });
};

const resetForm = () => {
  productFormRef.value?.resetFields(); // 🔥 Clears validation & fields
  product.value = { ...defaultProduct }; // Resets product data
};
</script>
