export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  description?: string | null;
  children?: Category[];
  books_count?: number;
}

export interface Book {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  author: string;
  publisher: string;
  isbn?: string | null;
  pages: number;
  published_year?: number | null;
  dimensions?: string | null;
  format: 'paperback' | 'hardcover' | 'ebook';
  regular_price: number;
  sale_price?: number | null;
  final_price: number;
  discount_percentage: number;
  stock: number;
  weight_grams: number;
  cover_image_url: string;
  description: string;
  table_of_contents?: string | null;
  is_best_seller: boolean;
  is_active: boolean;
  category?: Category;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'admin' | 'warehouse';
}

export interface Address {
  id: number;
  user_id: number;
  recipient_name: string;
  phone: string;
  street_address: string;
  province_id: string;
  city_id: string;
  district_id: string;
  postal_code: string;
  is_default: boolean;
}

export interface DestinationCity {
  city_id: string;
  city_name: string;
  district_id: string;
  district_name: string;
  postal_code: string;
}

export interface DestinationProvince {
  province_id: string;
  province_name: string;
  cities: DestinationCity[];
}

export interface ShippingRate {
  courier: string;
  courier_name?: string;
  service: string;
  service_name?: string;
  cost: number;
  etd: string;
  weight_kg?: number;
  description?: string;
}

export interface OrderItem {
  id: number;
  order_id?: number;
  book_id: number;
  quantity: number;
  price_unit: number;
  subtotal: number;
  title?: string;
  slug?: string;
  cover_image?: string;
  author?: string;
  book?: Book;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  total_books_price: number;
  shipping_cost: number;
  grand_total: number;
  courier_code: string;
  courier_service: string;
  shipping_address: {
    recipient_name: string;
    phone: string;
    street_address: string;
    province_id: string;
    city_id: string;
    district_id: string;
    postal_code: string;
  };
  tracking_number?: string | null;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  payment_channel?: string | null;
  payment_status: 'unpaid' | 'paid' | 'expired' | 'failed';
  payment_payload?: Record<string, unknown> | null;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
  links: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}
