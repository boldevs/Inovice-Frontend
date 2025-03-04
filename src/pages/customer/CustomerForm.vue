<template>
  <el-form ref="customerFormRef" :model="customer" :rules="rules" label-width="120px">
    <el-form-item label="Customer Name" prop="name">
      <el-input v-model="customer.name" placeholder="Enter customer name" />
    </el-form-item>

    <el-form-item label="Email" prop="email">
      <el-input v-model="customer.email" type="email" placeholder="Enter email" />
    </el-form-item>

    <el-form-item label="Phone" prop="phone">
      <el-input v-model="customer.phone" placeholder="Enter phone number" />
    </el-form-item>

    <el-form-item label="Address">
      <el-input v-model="customer.address" type="textarea" placeholder="Enter customer address" />
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
import type { Customer } from '../../types/customer/customerTypes';

const props = defineProps<{ modelValue: Customer | null }>();
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const defaultCustomer: Customer = {
  id: '',
  name: '',
  email: '',
  phone: '',
  address: '',
};

const customerFormRef = ref();
const customer = ref<Customer>({ ...defaultCustomer });

watch(
  () => props.modelValue,
  (newValue) => {
    customer.value = newValue ? { ...newValue } : { ...defaultCustomer };
  },
  { immediate: true }
);

const rules = {
  name: [{ required: true, message: 'Customer name is required', trigger: 'blur' }],
  email: [{ required: true, message: 'Valid email is required', type: 'email', trigger: 'blur' }],
  phone: [
    { required: true, message: 'Phone number is required', trigger: 'blur' },
    { pattern: /^\+?[1-9]\d{1,14}$/, message: 'Phone number must be in E.164 format (e.g. +85512345678)', trigger: 'blur' },
  ],
};


const isEditMode = computed(() => !!customer.value.id);

const submitForm = () => {
  customerFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      emit('submit', customer.value);
      resetForm();
    }
  });
};

const resetForm = () => {
  customerFormRef.value?.resetFields();
  customer.value = { ...defaultCustomer }; // Ensures empty fields, not null
};
</script>