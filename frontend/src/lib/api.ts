import axios from 'axios';
import { Book, Category, Order, PaginatedResponse, ShippingRate } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jb_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Books API
  async getBooks(params?: {
    page?: number;
    limit?: number;
    category?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'bestseller';
    q?: string;
  }): Promise<PaginatedResponse<Book>> {
    const { data } = await apiClient.get('/books', { params });
    return data;
  },

  async getBookBySlug(slug: string): Promise<{ data: Book; related_books: Book[] }> {
    const { data } = await apiClient.get(`/books/${slug}`);
    return data;
  },

  async getBestSellers(limit: number = 8): Promise<Book[]> {
    const { data } = await apiClient.get('/books', {
      params: { sort: 'bestseller', limit },
    });
    return data.data;
  },

  // Categories API
  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get('/categories');
    return data.data;
  },

  // Shipping API
  async getDestinations(): Promise<import('@/types').DestinationProvince[]> {
    const { data } = await apiClient.get('/shipping/destinations');
    return data.data;
  },

  async calculateShipping(payload: {
    destination_district_id: string;
    total_weight_grams: number;
    courier?: string[];
  }): Promise<{
    origin: string;
    destination_district_id: string;
    total_weight_grams: number;
    weight_kg: number;
    rates: ShippingRate[];
  }> {
    const { data } = await apiClient.post('/shipping/calculate', payload);
    return data.data;
  },

  // Checkout API
  async checkout(payload: {
    guest_info?: { name: string; email: string; phone: string };
    address: {
      recipient_name: string;
      phone: string;
      street_address: string;
      province_id: string;
      city_id: string;
      district_id: string;
      postal_code: string;
      email?: string;
    };
    courier: { code: string; service: string; cost: number };
    items: { book_id: number; qty: number }[];
  }): Promise<{
    order_number: string;
    grand_total: number;
    total_books_price: number;
    shipping_cost: number;
    status: string;
    payment_status: string;
    snap_token: string;
    snap_redirect_url: string;
    created_at: string;
  }> {
    const { data } = await apiClient.post('/checkout', payload);
    return data.data;
  },

  // Orders API
  async getOrder(orderNumber: string): Promise<Order> {
    const { data } = await apiClient.get(`/orders/${orderNumber}`);
    return data.data;
  },

  // Sandbox Payment Simulation
  async simulatePayment(orderNumber: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post(`/orders/${orderNumber}/simulate-pay`);
    return data;
  },

  // Auth API
  async login(credentials: { email: string; password: string }): Promise<{
    token: string;
    user: import('@/types').User;
  }> {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data;
  },

  async getMe(): Promise<import('@/types').User> {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  // Admin API
  async getAdminDashboard(): Promise<{
    metrics: {
      total_revenue: number;
      total_orders: number;
      pending_orders: number;
      paid_orders: number;
      shipped_orders: number;
      total_books: number;
      active_books: number;
      low_stock_count: number;
    };
    recent_orders: any[];
    low_stock_books: any[];
  }> {
    const { data } = await apiClient.get('/admin/dashboard');
    return data.data;
  },

  async getAdminBooks(params?: {
    page?: number;
    limit?: number;
    q?: string;
    category_id?: number | string;
    stock_status?: 'all' | 'low' | 'out_of_stock';
  }): Promise<PaginatedResponse<Book>> {
    const { data } = await apiClient.get('/admin/books', { params });
    return data;
  },

  async createAdminBook(bookData: Partial<Book>): Promise<Book> {
    const { data } = await apiClient.post('/admin/books', bookData);
    return data.data;
  },

  async updateAdminBook(id: number, bookData: Partial<Book>): Promise<Book> {
    const { data } = await apiClient.put(`/admin/books/${id}`, bookData);
    return data.data;
  },

  async deleteAdminBook(id: number): Promise<void> {
    await apiClient.delete(`/admin/books/${id}`);
  },

  async getAdminOrders(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  }): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get('/admin/orders', { params });
    return data;
  },

  async getAdminOrder(id: number): Promise<Order> {
    const { data } = await apiClient.get(`/admin/orders/${id}`);
    return data.data;
  },

  async updateAdminOrderStatus(id: number, status: string): Promise<Order> {
    const { data } = await apiClient.patch(`/admin/orders/${id}/status`, { status });
    return data.data;
  },

  async updateAdminOrderTracking(id: number, tracking_number: string, courier_code?: string): Promise<Order> {
    const { data } = await apiClient.patch(`/admin/orders/${id}/tracking`, {
      tracking_number,
      courier_code,
    });
    return data.data;
  },
};
