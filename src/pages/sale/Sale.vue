<template>
  <el-card class="shadow-md">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="text-2xl font-bold">Sales Transactions</span>
        <el-button type="primary" @click="openCreateModal" class="shadow-md wider-btn">
          <el-icon style="margin-right: 8px">
            <Plus />
          </el-icon>
          Add Sale
        </el-button>
      </div>
    </template>

    <el-table v-loading="loading" :data="sales" stripe border class="rounded-md">
      <el-table-column prop="invoiceNumber" label="Invoice #" sortable />
      <el-table-column prop="userName" label="Sale Person" sortable />
      <el-table-column prop="customerName" label="Customer" sortable />
      <el-table-column prop="issuedDate" label="Issued Date" sortable>
        <template #default="scope">{{
          formatDate(scope.row.issuedDate)
        }}</template>
      </el-table-column>
      <el-table-column prop="dueDate" label="Due Date" sortable>
        <template #default="scope">{{
          formatDate(scope.row.dueDate)
        }}</template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="Total Amount" sortable>
        <template #default="scope">
          ${{ (scope.row.totalAmount ?? 0).toFixed(2) }}
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="120" align="center">
        <template #default="scope">
          <el-dropdown>
            <el-button type="text" class="text-blue-500 hover:underline">•••</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="editSale(scope.row)">Edit</el-dropdown-item>
                <el-dropdown-item @click="deleteSale(scope.row)" class="text-red-500">
                    Delete
                  </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!sales.length && !loading" description="No sales records found."
      class="h-full flex items-center justify-center" />

    <!-- Create Sale Popup -->
      <SaleForm v-model:modelValue="newSale" v-model:visible="showCreateModal" @submit="handleCreateSale"
        @cancel="showCreateModal = false" />

  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import SaleForm from "../sale/SaleForm.vue";
import { getInvoices, createInvoice, createInvoiceLine, getInvoiceById , deleteInvoice, deleteInvoiceLine, getInvoiceLineByInvoiceId } from "../../utils/api";
import { ElMessage, ElMessageBox } from "element-plus";
import type { Sale, SaleDto } from "../../types/sale/salesTypes";
import { Plus } from "@element-plus/icons-vue";

const showCreateModal = ref(false);
const sales = ref<SaleDto[]>([]);
const loading = ref(false);

// Function to get default sale object
const getDefaultSale = (): Sale => ({
  invoiceNumber: "",
  userId: "",
  customerId: "",
  issuedDate: new Date().toISOString().split("T")[0],
  dueDate: new Date().toISOString().split("T")[0],
  totalAmount: 0,
  items: [],
});

const newSale = ref<Sale>(getDefaultSale());

// Fetch sales from API
const fetchSales = async () => {
  try {
    loading.value = true;
    const response = await getInvoices();
    sales.value = response.items;

    console.log("Invoice:", sales);
  } catch (error) {
    ElMessage.error("Failed to fetch sales data.");
  } finally {
    loading.value = false;
  }
};

// Open create modal
const openCreateModal = () => {
  newSale.value = getDefaultSale();
  showCreateModal.value = true;
};

// create Sale
const handleCreateSale = async (sale: Sale) => {
  try {
    const invoiceId = await createInvoice(sale);

    for (const item of sale.items) {
      await createInvoiceLine(invoiceId, item);
    }

    const newSale = await getInvoiceById(invoiceId);

    sales.value = [...sales.value, newSale]; 

    ElMessage.success("Sale added successfully!");

    showCreateModal.value = false;
  } catch (error) {
    ElMessage.error("Failed to add sale.");
  }
};

// Handle edit sale
const editSale = async (sale: SaleDto) => {

  sale.items = await getInvoiceLineByInvoiceId(sale.id);

  newSale.value = { ...sale };

  console.log("Sale Edit", newSale);

  showCreateModal.value = true;
};

const deleteSale = async (invoice: SaleDto) => {
  if (!invoice.id) {
    ElMessage.error("❌ Invalid Invoice ID.");
    return;
  }

  try {

    await ElMessageBox.confirm(
      "Are you sure you want to delete this invoice? This action cannot be undone.",
      "Confirm Deletion",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    try {
      await deleteInvoiceLine(invoice.id);
    } catch (lineError) {
      console.error("❌ Error deleting invoice lines:", lineError);
      ElMessage.error("❌ Failed to delete invoice lines. Invoice deletion aborted.");
      return;
    }

    await deleteInvoice(invoice.id);

    ElMessage.success("✅ Invoice deleted successfully.");

    sales.value = sales.value.filter((sale) => sale.id !== invoice.id);

  } catch (error) {
    console.error("❌ Error deleting invoice:", error);
    ElMessage.error("❌ Failed to delete invoice.");
  }
};

// Format date function
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// Fetch sales on page load
onMounted(fetchSales);
</script>
