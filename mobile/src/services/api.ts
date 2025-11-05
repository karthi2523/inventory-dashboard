import axios from 'axios';
import { Product, ProductFormData } from '../types';

const API_BASE_URL = 'https://inventory-backend-5rk8.onrender.com/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log('Making request to:', `${API_BASE_URL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.log('Request error:', error.message);
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ Response received:', response.status);
    }
    return response;
  },
  (error) => {
    console.log('❌ API Error:', {
      code: error.code,
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
    });
    
   
    if (error.code === 'ECONNABORTED') {
      console.log(' Request timeout - server might be sleeping');
    } else if (error.code === 'NETWORK_ERROR') {
      console.log(' Network error - check internet connection');
    }
    
    return Promise.reject(error);
  }
);


export const productAPI = {
  getAll: () => api.get<{ success: boolean; data: Product[] }>('/products'),

  create: (product: ProductFormData) =>
    api.post<{ success: boolean; data: Product }>('/products', product),

  update: (id: number, product: ProductFormData) =>
    api.put<{ success: boolean; data: Product }>(`/products/${id}`, product),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/products/${id}`),
};

export default api;