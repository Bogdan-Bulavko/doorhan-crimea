'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { useCache } from './useCache';

interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  isMain: boolean;
}

interface ProductSpecification {
  id: number;
  name: string;
  value: string;
}

interface ProductColor {
  id: number;
  name: string;
  hex: string;
}

interface Product {
  id: number;
  name: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  mainImageUrl?: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  slug: string;
  sku?: string;
  price: string; // Изменено на string для Decimal
  oldPrice?: string | null; // Изменено на string для Decimal
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: string; // Изменено на string для Decimal
  reviewsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  colors?: ProductColor[];
  createdAt: string;
  updatedAt: string;
}

interface UseProductsOptions {
  categoryId?: number;
  categorySlug?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

export const useProducts = (
  options: UseProductsOptions = {}
): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  // Debounce опции для предотвращения слишком частых запросов
  const debouncedOptions = useDebounce(options, 300);
  
  // Кэширование для предотвращения повторных запросов
  const cache = useCache<{ products: Product[]; pagination: { page: number; limit: number; total: number; pages: number } }>(2 * 60 * 1000); // 2 минуты

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    const fetchProducts = async () => {
      if (!isMounted) return;
      
      // Создаем ключ кэша на основе параметров
      const cacheKey = JSON.stringify(debouncedOptions);
      
      // Проверяем кэш
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        setProducts(cachedData.products);
        setPagination(cachedData.pagination);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);


        const params = new URLSearchParams();
        if (debouncedOptions.categoryId)
          params.append('categoryId', debouncedOptions.categoryId.toString());
        if (debouncedOptions.categorySlug)
          params.append('categorySlug', debouncedOptions.categorySlug);
        if (debouncedOptions.page) params.append('page', debouncedOptions.page.toString());
        if (debouncedOptions.limit) params.append('limit', debouncedOptions.limit.toString());
        if (debouncedOptions.search) params.append('search', debouncedOptions.search);
        if (debouncedOptions.sortBy) params.append('sortBy', debouncedOptions.sortBy);
        if (debouncedOptions.sortOrder) params.append('sortOrder', debouncedOptions.sortOrder);

        // Добавляем таймаут для запроса
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут

        const response = await fetch(`/api/products/?${params}`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404 && retryCount < maxRetries) {
            retryCount++;
            console.warn(`API не найден, попытка ${retryCount}/${maxRetries}`);
            // Задержка перед повтором
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (isMounted) {
              return fetchProducts();
            }
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!isMounted) return;

        if (result.success) {
          // Сериализуем данные для корректной работы с Decimal
          const serializedProducts = result.data.map((product: Product) => ({
            ...product,
            price: product.price.toString(),
            oldPrice: product.oldPrice?.toString() || null,
            rating: product.rating.toString(),
          }));

          // Сохраняем в кэш
          cache.set(cacheKey, {
            products: serializedProducts,
            pagination: result.pagination,
          });

          setProducts(serializedProducts);
          setPagination(result.pagination);
        } else {
          setError(result.message || 'Ошибка при загрузке товаров');
        }
      } catch (err) {
        if (!isMounted) return;
        
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Превышено время ожидания запроса');
        } else {
          setError('Ошибка сети при загрузке товаров');
        }
        console.error('Products fetch error:', err);
        
        // Устанавливаем пустой массив при ошибке
        setProducts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [debouncedOptions, cache]);

  return { products, loading, error, pagination };
};

export const useProductsByCategory = (
  categorySlug: string,
  page = 1,
  limit = 12
) => {
  return useProducts({ categorySlug, page, limit });
};

export const useFeaturedProducts = (limit = 8) => {
  return useProducts({ limit, sortBy: 'isFeatured', sortOrder: 'desc' });
};
