import { LucideIcon } from 'lucide-react';

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
  // Категории товаров
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: '/api/categories/:id',
  
  // Товары
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: '/api/products/:id',
  PRODUCTS_BY_CATEGORY: '/api/products?category=:category',
  PRODUCTS_SEARCH: '/api/products/search?q=:query',
  
  // Поиск и фильтрация
  SEARCH: '/api/search',
  FILTER_PRODUCTS: '/api/products/filter',
  
  // Корзина
  CART: '/api/cart',
  CART_ITEM: '/api/cart/:id',
  
  // Заказы
  ORDERS: '/api/orders',
  ORDER_BY_ID: '/api/orders/:id',
  CREATE_ORDER: '/api/orders',
  
  // Пользователи
  USERS: '/api/users',
  USER_BY_ID: '/api/users/:id',
  
  // Контакты и формы
  CONTACT_FORM: '/api/contact',
  CALLBACK_FORM: '/api/callback',
  
  // Файлы и изображения
  UPLOAD_IMAGE: '/api/upload/image',
  
  // Статистика
  STATS: '/api/stats',
} as const;

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== CATEGORY TYPES =====
export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  icon?: LucideIcon;
  color: string;
  hoverColor: string;
  productCount: number;
  href: string;
  slug: string;
  parentId?: number;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  parentId?: number;
  isActive?: boolean;
  sortBy?: 'name' | 'sortOrder' | 'productCount';
  sortOrder?: 'asc' | 'desc';
}

// ===== PRODUCT TYPES =====
export interface Product {
  id: number;
  name: string;
  title: string;
  description: string;
  shortDescription?: string;
  image: string;
  images: string[];
  features: string[];
  price: number;
  oldPrice?: number;
  currency: string;
  category: string;
  categoryId: number;
  slug: string;
  sku?: string;
  inStock: boolean;
  stockQuantity?: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: number;
  reviews: number;
  icon?: LucideIcon;
  color: string;
  hoverColor: string;
  specifications: ProductSpecification[];
  colors: ProductColor[];
  relatedProducts?: number[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface ProductColor {
  name: string;
  value: string;
  hex: string;
  image?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  rating?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  filters?: ProductFilters;
}

// ===== CART TYPES =====
export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedOptions?: Record<string, any>;
  price: number;
  totalPrice: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
  selectedColor?: string;
  selectedOptions?: Record<string, any>;
}

export interface UpdateCartItemRequest {
  quantity: number;
  selectedColor?: string;
  selectedOptions?: Record<string, any>;
}

// ===== ORDER TYPES =====
export interface Order {
  id: number;
  orderNumber: string;
  userId?: number;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
  selectedColor?: string;
  selectedOptions?: Record<string, any>;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
}

export interface Address {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface CreateOrderRequest {
  customerInfo: CustomerInfo;
  items: AddToCartRequest[];
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
}

// ===== USER TYPES =====
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'admin' | 'manager';

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ===== FORM TYPES =====
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message: string;
}

export interface CallbackFormData {
  name: string;
  phone: string;
  preferredTime?: string;
  message?: string;
}

export interface ContactInfo {
  icon: LucideIcon;
  title: string;
  content: string;
  description: string;
  href: string;
  color?: string;
}

// ===== STATISTICS TYPES =====
export interface Stat {
  icon: LucideIcon;
  number: number;
  suffix: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

export interface SiteStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
  popularCategories: Array<{
    category: Category;
    productCount: number;
  }>;
  recentOrders: Order[];
}

// ===== UI COMPONENT TYPES =====
export interface Achievement {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  position: string;
  experience: string;
  image: string;
}

export interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface MenuItem {
  name: string;
  href: string;
}

export interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

export interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
}

// ===== ERROR TYPES =====
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===== UTILITY TYPES =====
export type SortOrder = 'asc' | 'desc';
export type SortField = 'name' | 'price' | 'rating' | 'createdAt' | 'updatedAt';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface FilterOptions {
  [key: string]: any;
}
