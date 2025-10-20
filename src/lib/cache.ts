// Simple in-memory cache for API responses
class CacheManager {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: unknown, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clear cache for specific pattern
  clearPattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new CacheManager();

// Cache keys generator
export const cacheKeys = {
  users: () => 'users:all',
  user: (id: string) => `user:${id}`,
  products: () => 'products:all',
  product: (id: string) => `product:${id}`,
  categories: () => 'categories:all',
  category: (id: string) => `category:${id}`,
  orders: () => 'orders:all',
  order: (id: string) => `order:${id}`,
  stats: () => 'stats:all',
  forms: () => 'forms:all',
} as const;

// Cache wrapper for API calls
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  if (cached) {
    return cached as T;
  }

  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}
