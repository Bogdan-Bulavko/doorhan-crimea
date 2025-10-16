import { 
  API_ENDPOINTS,
  ApiResponse,
  PaginatedResponse,
  Category,
  Product,
  ProductFilters,
  Cart,
  CartItem,
  AddToCartRequest,
  Order,
  CreateOrderRequest,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ContactFormData,
  CallbackFormData,
  SiteStats
} from '@/types';

// ===== API CLIENT CLASS =====
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Добавляем токен авторизации если есть
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // ===== CATEGORIES API =====
  async getCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>(API_ENDPOINTS.CATEGORIES);
    return response.data;
  }

  async getCategoryById(id: number): Promise<Category> {
    const endpoint = API_ENDPOINTS.CATEGORY_BY_ID.replace(':id', id.toString());
    const response = await this.request<Category>(endpoint);
    return response.data;
  }

  // ===== PRODUCTS API =====
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `${API_ENDPOINTS.PRODUCTS}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data;
  }

  async getProductById(id: number): Promise<Product> {
    const endpoint = API_ENDPOINTS.PRODUCT_BY_ID.replace(':id', id.toString());
    const response = await this.request<Product>(endpoint);
    return response.data;
  }

  async getProductsByCategory(category: string, filters?: Omit<ProductFilters, 'category'>): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({ category });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `${API_ENDPOINTS.PRODUCTS}?${params.toString()}`;
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data;
  }

  async searchProducts(query: string, filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `${API_ENDPOINTS.SEARCH}?${params.toString()}`;
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data;
  }

  // ===== CART API =====
  async getCart(): Promise<Cart> {
    const response = await this.request<Cart>(API_ENDPOINTS.CART);
    return response.data;
  }

  async addToCart(item: AddToCartRequest): Promise<CartItem> {
    const response = await this.request<CartItem>(API_ENDPOINTS.CART, {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return response.data;
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    const endpoint = API_ENDPOINTS.CART_ITEM.replace(':id', itemId.toString());
    const response = await this.request<CartItem>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return response.data;
  }

  async removeFromCart(itemId: number): Promise<void> {
    const endpoint = API_ENDPOINTS.CART_ITEM.replace(':id', itemId.toString());
    await this.request<void>(endpoint, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<void> {
    await this.request<void>(API_ENDPOINTS.CART, {
      method: 'DELETE',
    });
  }

  // ===== ORDERS API =====
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await this.request<Order>(API_ENDPOINTS.CREATE_ORDER, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data;
  }

  async getOrders(): Promise<Order[]> {
    const response = await this.request<Order[]>(API_ENDPOINTS.ORDERS);
    return response.data;
  }

  async getOrderById(id: number): Promise<Order> {
    const endpoint = API_ENDPOINTS.ORDER_BY_ID.replace(':id', id.toString());
    const response = await this.request<Order>(endpoint);
    return response.data;
  }

  // ===== AUTH API =====
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success) {
      this.setAuthToken(response.data.token);
    }
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success) {
      this.setAuthToken(response.data.token);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.removeAuthToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/api/auth/me');
    return response.data;
  }

  // ===== FORMS API =====
  async submitContactForm(formData: ContactFormData): Promise<void> {
    await this.request<void>(API_ENDPOINTS.CONTACT_FORM, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async submitCallbackForm(formData: CallbackFormData): Promise<void> {
    await this.request<void>(API_ENDPOINTS.CALLBACK_FORM, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // ===== STATS API =====
  async getStats(): Promise<SiteStats> {
    const response = await this.request<SiteStats>(API_ENDPOINTS.STATS);
    return response.data;
  }
}

// ===== API INSTANCE =====
export const apiClient = new ApiClient();

// ===== HOOKS FOR REACT QUERY / SWR =====
export const apiHooks = {
  // Categories
  useCategories: () => ({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  }),

  useCategory: (id: number) => ({
    queryKey: ['category', id],
    queryFn: () => apiClient.getCategoryById(id),
  }),

  // Products
  useProducts: (filters?: ProductFilters) => ({
    queryKey: ['products', filters],
    queryFn: () => apiClient.getProducts(filters),
  }),

  useProduct: (id: number) => ({
    queryKey: ['product', id],
    queryFn: () => apiClient.getProductById(id),
  }),

  useProductsByCategory: (category: string, filters?: Omit<ProductFilters, 'category'>) => ({
    queryKey: ['products', 'category', category, filters],
    queryFn: () => apiClient.getProductsByCategory(category, filters),
  }),

  useSearchProducts: (query: string, filters?: ProductFilters) => ({
    queryKey: ['products', 'search', query, filters],
    queryFn: () => apiClient.searchProducts(query, filters),
  }),

  // Cart
  useCart: () => ({
    queryKey: ['cart'],
    queryFn: () => apiClient.getCart(),
  }),

  // Orders
  useOrders: () => ({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
  }),

  useOrder: (id: number) => ({
    queryKey: ['order', id],
    queryFn: () => apiClient.getOrderById(id),
  }),

  // User
  useCurrentUser: () => ({
    queryKey: ['user', 'current'],
    queryFn: () => apiClient.getCurrentUser(),
  }),

  // Stats
  useStats: () => ({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
  }),
};

// ===== UTILITY FUNCTIONS =====
export const formatPrice = (price: number, currency: string = '₽'): string => {
  return `${price.toLocaleString('ru-RU')} ${currency}`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU');
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// ===== ERROR HANDLING =====
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.response) {
    return new ApiError(
      error.response.data?.message || 'Server error',
      error.response.status,
      error.response.data?.code
    );
  }

  if (error.request) {
    return new ApiError('Network error - no response received');
  }

  return new ApiError(error.message || 'Unknown error occurred');
};
