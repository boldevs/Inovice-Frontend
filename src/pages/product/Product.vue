<template>
  <el-card class="shadow-md">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="text-2xl font-bold">Product List</span>
        <div class="flex gap-3">
          <el-button type="primary" @click="openCreateModal" class="shadow-md ">
            <el-icon style="margin-right: 8px">
              <Plus />
            </el-icon> Add Product
          </el-button>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="products" stripe border class="rounded-md">
      <el-table-column prop="barcode" label="Barcode" sortable />
      <el-table-column prop="name" label="Product Name" sortable />
      <el-table-column prop="descriptions" label="Description" />
      <el-table-column prop="unitPrice" label="Price" sortable>
        <template #default="scope">
          <span class="text-blue-600 font-bold">${{ scope.row.unitPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="120" align="center">
        <template #default="scope">
          <el-dropdown>
            <el-button type="text" class="text-blue-500 hover:underline">
              •••
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="editProduct(scope.row)">Edit</el-dropdown-item>
                <el-dropdown-item @click="deleteProduct(scope.row.itemId)" class="text-red-500">
                  Delete
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>

    </el-table>

    <el-empty v-if="!products.length && !loading" description="No products available."
      class="h-full flex items-center justify-center" />

    <!-- Create Product Popup -->
    <el-dialog v-model="showCreateModal" title="Create New Product" width="500px" :close-on-click-modal="false">
      <ProductForm v-model="newProduct" @submit="handleCreateProduct" @cancel="showCreateModal = false" />
    </el-dialog>

    <!-- Edit Product Popup -->
    <el-dialog v-model="showEditModal" title="Edit Product" width="500px" :close-on-click-modal="false">
      <ProductForm v-if="selectedProduct" v-model="selectedProduct" @submit="handleUpdateProduct"
        @cancel="showEditModal = false" />
    </el-dialog>

  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProductForm from '../../components/ProductForm.vue';
import { getProducts, createProduct, deleteProductById, updateProduct } from '../../utils/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Product } from '../../types/product/productTypes';
import { Plus } from '@element-plus/icons-vue';

const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedProduct = ref<Product | null>(null);
const products = ref<Product[]>([]);
const loading = ref(false);

const newProduct = ref<Product>({
  itemId: '',
  barcode: '',
  name: '',
  descriptions: '',
  unitPrice: 0,
});

const openCreateModal = () => {
  newProduct.value = {
    itemId: '',
    barcode: '',
    name: '',
    descriptions: '',
    unitPrice: 0,
  };
  showCreateModal.value = true;
};

// Fetch products from API
const fetchProducts = async () => {
  try {
    loading.value = true;
    const response = await getProducts();
    products.value = response;
  } catch (error) {
    ElMessage.error('Failed to fetch products.');
  } finally {
    loading.value = false;
  }
};

// Handle edit product
const editProduct = (product: Product) => {
  selectedProduct.value = { ...product };
  showEditModal.value = true;
};

// Handle update product
const handleUpdateProduct = async (product: Product) => {
  if (!selectedProduct.value) return;

  try {
    await updateProduct(selectedProduct.value.itemId, product);
    ElMessage.success('Product updated successfully!');
    showEditModal.value = false;
    fetchProducts(); // Refresh product list after update
  } catch (error) {
    ElMessage.error('Failed to update product.');
  }
};

const handleCreateProduct = async (product: Product) => {
  try {
    await createProduct(product);
    ElMessage.success('Product created successfully!');
    showCreateModal.value = false;
    fetchProducts(); // Refresh product list
  } catch (error) {
    ElMessage.error('Failed to create product.');
  }
};


// Handle delete product
const deleteProduct = async (id: string) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this product?', 'Warning', {
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      type: 'warning',
    });

    await deleteProductById(id); // Send DELETE request with GUID

    ElMessage.success('Product deleted successfully!');
    products.value = products.value.filter((product) => product.itemId !== id); // Remove from UI instantly
  } catch (error) {
    ElMessage.error('Failed to delete product.');
  }
};

// Fetch products on page load
onMounted(fetchProducts);

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
