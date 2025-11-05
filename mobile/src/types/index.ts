export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  created_at: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
}

export interface Stats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
}