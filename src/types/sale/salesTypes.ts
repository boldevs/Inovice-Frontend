export interface Sale {
  invoiceNumber: string;
  userId: string;
  customerId: string;
  issuedDate: string;
  dueDate: string;
  totalAmount: number;
  items: SaleItem[]; 
}

export interface SaleDto {
  id: string;
  invoiceNumber: string;
  userId: string;
  customerId: string;
  issuedDate: string;
  dueDate: string;
  totalAmount: number;
  items: SaleItem[]; 
}

export interface SaleItem {
  invoiceId: string; 
  itemId: string;
  quantity: number; 
  unitPrice: number; 
}
