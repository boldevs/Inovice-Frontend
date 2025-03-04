<template>
  <el-card class="shadow-md">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="text-2xl font-bold">Customer List</span>
        <div class="flex gap-3">
          <el-button type="primary" @click="openCreateModal" class="shadow-md wider-btn">
            <el-icon style="margin-right: 8px">
              <Plus />
            </el-icon> Add Customer
          </el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="customers" stripe border class="rounded-md">
      <el-table-column prop="name" label="Name" sortable />
      <el-table-column prop="email" label="Email" sortable />
      <el-table-column prop="phone" label="Phone" sortable />
      <el-table-column prop="address" label="Address" />
      <el-table-column label="Actions" width="120" align="center">
        <template #default="scope">
          <el-dropdown>
            <el-button type="text" class="text-blue-500 hover:underline">•••</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="editCustomer(scope.row)">Edit</el-dropdown-item>
                <el-dropdown-item @click="deleteCustomer(scope.row.id)" class="text-red-500">
                  Delete
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!customers.length && !loading" description="No customers available."
      class="h-full flex items-center justify-center" />

    <!-- Create Customer Popup -->
    <el-dialog v-model="showCreateModal" title="Add Customer" width="500px" :close-on-click-modal="false">
      <CustomerForm v-model="newCustomer" @submit="handleCreateCustomer" @cancel="showCreateModal = false" />
    </el-dialog>

    <!-- Edit Customer Popup -->
    <el-dialog v-model="showEditModal" title="Edit Customer" width="500px" :close-on-click-modal="false">
      <CustomerForm v-if="selectedCustomer" v-model="selectedCustomer" @submit="handleUpdateCustomer"
        @cancel="showEditModal = false" />
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CustomerForm from '../customer/CustomerForm.vue';
import { getCustomers, createCustomer, updateCustomer, deleteCustomerById } from '../../utils/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Customer } from '../../types/customer/customerTypes';
import { Plus } from '@element-plus/icons-vue';

const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedCustomer = ref<Customer | null>(null);
const customers = ref<Customer[]>([]);
const loading = ref(false);
const newCustomer = ref<Customer>({
  id: '',
  name: '',
  email: '',
  phone: '',
  address: '',
});

// Fetch customers from API
const fetchCustomers = async () => {
  try {
    loading.value = true;
    const response = await getCustomers();
    customers.value = response;
  } catch (error) {
    ElMessage.error('Failed to fetch customers.');
  } finally {
    loading.value = false;
  }
};

// Open create modal
const openCreateModal = () => {
  newCustomer.value = { id: '', name: '', email: '', phone: '', address: '' };
  showCreateModal.value = true;
};

const handleCreateCustomer = async (customer: Customer) => {
  try {
    const newCustomerData = {
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
    };

    console.log("📡 Sending Customer Data:", newCustomerData); // ✅ Debugging Log

    await createCustomer(newCustomerData);
    ElMessage.success('Customer added successfully!');
    showCreateModal.value = false;
    fetchCustomers(); // Refresh list
  } catch (error: any) {
    console.error("❌ API Error:", error);

    if (error.response?.status === 400 && error.response?.data?.errors) {
      // Extract validation errors from API response
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .map((err: any) => err.description)
        .join("\n");

      ElMessageBox.alert(errorMessages, "Validation Error", { type: "error" });
    } else {
      ElMessage.error("Failed to add customer.");
    }
  }
};

// Handle edit customer
const editCustomer = (customer: Customer) => {
  selectedCustomer.value = { ...customer };
  showEditModal.value = true;
};

// Handle update customer
const handleUpdateCustomer = async (customer: Customer) => {
  if (!selectedCustomer.value) return;

  try {
    await updateCustomer(selectedCustomer.value.id, customer);
    ElMessage.success('Customer updated successfully!');
    showEditModal.value = false;
    fetchCustomers();
  } catch (error) {
    ElMessage.error('Failed to update customer.');
  }
};

// Handle delete customer
const deleteCustomer = async (id: string) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this customer?', 'Warning', {
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      type: 'warning',
    });

    await deleteCustomerById(id);
    ElMessage.success('Customer deleted successfully!');
    
    customers.value = customers.value.filter((customer) => customer.id !== id); // ✅ Instantly remove from UI
  } catch (error: any) {
    console.error("❌ Delete Error:", error);
    ElMessage.error(error.response?.data?.detail || 'Failed to delete customer.');
  }
};

// Fetch customers on page load
onMounted(fetchCustomers);
</script>

<style scoped>
.wider-btn {
  min-width: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>