<template>
    <el-dialog  :model-value="visible" @update:model-value="emit('update:visible', $event)" title="Invoice" width="80%"
        top="5vh" :close-on-click-modal="false">
        <el-form ref="saleFormRef" :model="sale" :rules="rules" label-width="120px">
            <div class="flex justify-between">
                <!-- Customer on the left -->
                <div class="w-[350px]">
                    <el-form-item label="Customer">
                        <el-select v-model="sale.customerId" placeholder="Select Customer" class="w-full">
                            <el-option v-for="customer in customers" :key="customer.id" :label="customer.name"
                                :value="customer.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Invoice #">
                        <el-input v-model="sale.invoiceNumber" placeholder="Invoice number" />
                    </el-form-item>
                </div>

                <!-- Invoice # and Due Date on the right (Stacked) -->
                <div>

                    <el-form-item label="Invoice Date">
                        <el-date-picker v-model="sale.issuedDate" type="date" class="w-1/4"
                            placeholder="Select due date" />
                    </el-form-item>
                    <el-form-item label="Due Date">
                        <el-date-picker v-model="sale.dueDate" type="date" class="w-1/4"
                            placeholder="Select due date" />
                    </el-form-item>
                </div>
            </div>

            <!-- Invoice Line Items Table -->
            <el-table :data="sale.items" border stripe>
                <el-table-column prop="itemId" label="Item">
                    <template #default="scope">
                        <el-select v-model="scope.row.itemId" placeholder="Select Item">
                            <el-option v-for="item in items" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </template>
                </el-table-column>

                <el-table-column prop="quantity" label="Quantity">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.quantity" :min="1" @change="updateTotalAmount" />
                    </template>
                </el-table-column>

                <el-table-column prop="unitPrice" label="Price Each">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.unitPrice" :min="0" @change="updateTotalAmount" />
                    </template>
                </el-table-column>

                <el-table-column prop="amount" label="Amount">
                    <template #default="scope">
                        <span>${{ (scope.row.quantity * scope.row.unitPrice).toFixed(2) }}</span>
                    </template>
                </el-table-column>

                <el-table-column label="Actions">
                    <template #default="scope">
                        <el-button type="danger" @click="removeItem(scope.$index)">Remove</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-button class="summary" type="primary" @click="addItem">Add Item</el-button>

            <!-- Summary Section -->
            <div class="summary">
                <el-form-item label="Total Amount">
                    <span>${{ totalAmount.toFixed(2) }}</span>
                </el-form-item>
            </div>

            <!-- Footer Buttons -->
            <div class="footer-buttons">
                <el-button type="primary" @click="submitForm">Save</el-button>
                <el-button type="warning" @click="resetForm">Clear</el-button>
                <el-button @click="closeDialog">Cancel</el-button>
            </div>

        </el-form>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue';
import { getCustomers, getProductsforSale, getUserId } from '../../utils/api';
import type { Sale } from '../../types/sale/salesTypes';
import { ElMessage } from 'element-plus';

// Props & Emits
const props = defineProps<{ modelValue: Sale | null, visible: boolean }>();
const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'update:visible']);

// Form State
const visible = ref(props.visible);
const saleFormRef = ref();

// Define Items & Customers List
const items = ref<{ id: string; name: string }[]>([]);
const customers = ref<{ id: string; name: string }[]>([]);
const userId = ref<string | null>(null);

onMounted(() => {
  userId.value = getUserId();
});

const rules = {
    customerId: [{ required: true, message: "Customer is required", trigger: "blur" }],
    invoiceNumber: [{ required: true, message: "Invoice number is required", trigger: "blur" }],
    dueDate: [{ required: true, message: "Due date is required", trigger: "change" }],
    "items[].itemId": [{ required: true, message: "Item selection is required", trigger: "blur" }],
    "items[].quantity": [{ required: true, message: "Quantity is required", trigger: "blur" }],
};

watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        sale.value = {
            ...newVal,
            items: newVal.items || []
        };
    }
}, { deep: true });

// Initialize sale object
const sale = ref<Sale>({
    invoiceNumber: '',
    userId: '',
    customerId: '',
    issuedDate: new Date().toISOString().split('T')[0],
    dueDate: getEndOfMonth(),
    totalAmount: 0,
    items: [] // ✅ Ensure items is always an array
});


function getEndOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
}

// Fetch Customers & Items
const fetchCustomersAndItems = async () => {
    try {
        customers.value = await getCustomers();
        items.value = await getProductsforSale();
    } catch (error) {
        console.error("❌ Failed to fetch data:", error);
    }
};

const closeDialog = () => {
  emit("update:visible", false);
};

// Add Item to Sale
const addItem = () => {
    sale.value.items.push({
        invoiceId: '',
        itemId: '',
        quantity: 1,
        unitPrice: 0,
    });
};

// Remove Item from Sale
const removeItem = (index: number) => {
    sale.value.items.splice(index, 1);
    updateTotalAmount(); // ✅ Update total after removing an item
};

// Compute Total Amount
const totalAmount = computed(() => {
    return (sale.value.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
});


// Update Total Amount
const updateTotalAmount = () => {
    sale.value.totalAmount = totalAmount.value;
};

// Handle Submit: Create Invoice & Line Items
const submitForm = async () => {
    try {
        await saleFormRef.value?.validate();


        if (!sale.value.customerId) {
            ElMessage.error("❌ Please select a customer.");
            return;
        }
        
        if (!sale.value.invoiceNumber.trim()) {
            ElMessage.error("❌ Invoice number is required.");
            return;
        }

        if (!sale.value.issuedDate) {
            ElMessage.error("❌ Please select an Issued Date.");
            return;
        }

        if (!sale.value.dueDate) {
            ElMessage.error("❌ Please select a Due Date.");
            return;
        }

        const issuedDate = new Date(sale.value.issuedDate);
        const dueDate = new Date(sale.value.dueDate);

        if (dueDate <= issuedDate) {
            ElMessage.error("❌ Due Date must be later than Issued Date.");
            return;
        }

        // ✅ Check if there are no items in the invoice
        if (sale.value.items.length === 0) {
            ElMessage.error("❌ You must add at least one item to the invoice.");
            return;
        }

        // Proceed with saving the invoice
        sale.value.userId = userId.value;
        emit("submit", sale.value);
        resetForm();
        visible.value = false;


    } catch (error) {
        console.error("❌ Error creating invoice:", error);
    }
};

// Reset Form
const resetForm = () => {
    sale.value = {
        invoiceNumber: '',
        userId: '',
        customerId: '',
        issuedDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        items: [],
    };
};

// Watch for external visibility change
watch(() => props.visible, (newVal) => {
    visible.value = newVal;
});

// Fetch customers and items on mount
onMounted(fetchCustomersAndItems);
</script>

<style scoped>
.form-header {
    display: flex;
    justify-content: space-between;
}

.summary {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    margin-top: 20px;
}

.footer-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}
</style>