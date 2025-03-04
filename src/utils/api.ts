// src/utils/api.ts
import { ref } from "vue";
import type { Product } from "../types/product/productTypes";
import type { Customer } from "../types/customer/customerTypes";
import type { Sale, SaleItem , SaleDto} from "../types/sale/salesTypes";

const token = ref<string | null>(localStorage.getItem("token"));
const userId = ref<string | null>(localStorage.getItem("userId"));

// Base URL for your API
const BASE_URL = "https://localhost:7296";

export const setAuthData = (newToken: string | null, newUserId: string | null) => {
  token.value = newToken;
  userId.value = newUserId;

  if (newToken) {
    localStorage.setItem("token", newToken);
  } else {
    localStorage.removeItem("token");
  }

  if (newUserId) {
    localStorage.setItem("userId", newUserId);
  } else {
    localStorage.removeItem("userId");
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getUserId = (): string | null => {
  return localStorage.getItem("userId");
};


export const clearAuthData = () => {
  token.value = null;
  userId.value = null;
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
};

export async function apiCall<T>(
  endpoint: string,
  method: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...headers,
  };

  try {
    console.log(`📡 API Call: ${method} ${BASE_URL}${endpoint}`, body); // ✅ Log request

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("❌ API Response Error:", errorResponse);
      throw new Error(`API Error: ${response.status} - ${errorResponse}`);
    }

    // ✅ Fix: Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);

  } catch (error) {
    console.error("❌ API Error:", error);
    throw error;
  }
}

// Specific function for login
export async function login(
  email: string,
  password: string
): Promise<{ token: string; userId: string }> {
  const response = await apiCall<any>("/users/login", "POST", { email, password });

  console.log("🔍 Login API Raw Response:", response); 

  if (!response.value || !response.value.token) {
    throw new Error("❌ Token not found in response");
  }

  return response.value; // ✅ Extract `value` before returning
}


// Example function for fetching protected data (e.g., user profile, products)
export async function getProtectedData(endpoint: string): Promise<any> {
  if (!token.value) {
    throw new Error("No token available. Please log in.");
  }
  return apiCall(endpoint, "GET");
}

//create Item
export async function createProduct(product: any): Promise<any> {
  return apiCall("/items", "POST", {
    barcode: product.barcode,
    name: product.name,
    descriptions: product.descriptions,
    unitPrice: product.unitPrice,
  });
}

//get Item
export async function getProducts(): Promise<Product[]> {
  return apiCall<Product[]>("/items", "GET");
}

export async function getProductsforSale(): Promise<{ id: string; name: string }[]> {
  const response = await apiCall<Product[]>("/items", "GET");
  
  return response.map(item => ({
    id: item.itemId, 
    name: item.name,
  }));
}


// Delete product by ID (GUID)
export async function deleteProductById(id: string): Promise<void> {
  return apiCall<void>(`/items/${id}`, "DELETE");
}

// Update product by ID (GUID)
export async function updateProduct(
  id: string,
  product: Product
): Promise<void> {
  return apiCall<void>(`/items/${id}`, "PUT", product);
}

// Get all customers
export async function getCustomers(): Promise<Customer[]> {
  return apiCall<Customer[]>("/customers", "GET");
}

// Create a new customer
export async function createCustomer(customer: any): Promise<any> {
  return apiCall("/customers", "POST", {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  });
}

// Update a customer
export async function updateCustomer(
  id: string,
  customer: Customer
): Promise<void> {
  return apiCall<void>(`/customers/${id}`, "PUT", customer);
}

// Delete a customer
export async function deleteCustomerById(id: string): Promise<void> {
  return apiCall<void>(`/customers/${id}`, "DELETE");
}

// Get all invoices with pagination and optional filters
export async function getInvoices(
  pageNumber: number = 1,
  pageSize: number = 10,
  userId?: string,
  customerId?: string,
  invoiceNumber?: string
): Promise<{ items: SaleDto[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }> {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (userId) params.append("UserId", userId);
  if (customerId) params.append("CustomerId", customerId);
  if (invoiceNumber) params.append("InvoiceNumber", invoiceNumber);

  return apiCall(`/invoices?${params.toString()}`, "GET");
}

// Create a new invoice
export async function createInvoice(invoice: Sale): Promise<string> {
  const response = await apiCall<string>("/invoices", "POST", {
    invoiceNumber: invoice.invoiceNumber,
    userId: invoice.userId,
    customerId: invoice.customerId,
    dueDate: invoice.dueDate,
    issuedDate: invoice.issuedDate,
    totalAmount: invoice.totalAmount,
  });

  console.log("📝 Invoice API Response:", response); // ✅ Logs raw response

  // ✅ Fix: If response is a string, return it directly
  if (typeof response === "string") {
    return response;
  }

  // 🚨 If response is not a string, throw an error
  throw new Error("❌ Invoice creation failed: Invalid response format.");
}

export async function getInvoiceById(id: string): Promise<SaleDto> {
  return apiCall<SaleDto>(`/invoices/${id}`, "GET");
}

export async function createInvoiceLine(invoiceId: string, item: SaleItem): Promise<void> {
  await apiCall("/invoice-line", "POST", {
    invoiceId: invoiceId, // Assign the Invoice ID
    itemId: item.itemId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  });
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  await apiCall<void>(`/invoices/${invoiceId}`, "DELETE");
}

export async function deleteInvoiceLine(invoiceId: string): Promise<void> {
  await apiCall<void>(`/invoice-line/${invoiceId}`, "DELETE");
}

export async function getInvoiceLineByInvoiceId(id: string): Promise<SaleItem[]> {
  return apiCall<SaleItem[]>(`/invoice-line/getby-invoiceid/${id}`, "GET");
}

