'use client';

import { useState, useEffect } from 'react';

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
  images?: any[];
  specifications?: any[];
  colors?: any[];
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
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 useProducts вызывается с параметрами:', options);

        const params = new URLSearchParams();
        if (options.categoryId)
          params.append('categoryId', options.categoryId.toString());
        if (options.categorySlug)
          params.append('categorySlug', options.categorySlug);
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.search) params.append('search', options.search);
        if (options.sortBy) params.append('sortBy', options.sortBy);
        if (options.sortOrder) params.append('sortOrder', options.sortOrder);

        const response = await fetch(`/api/products?${params}`);
        const result = await response.json();

        if (result.success) {
          // Сериализуем данные для корректной работы с Decimal
          const serializedProducts = result.data.map((product: any) => ({
            ...product,
            price: product.price.toString(),
            oldPrice: product.oldPrice?.toString() || null,
            rating: product.rating.toString(),
          }));

          setProducts(serializedProducts);
          setPagination(result.pagination);
        } else {
          setError(result.message || 'Ошибка при загрузке товаров');
        }
      } catch (err) {
        setError('Ошибка сети при загрузке товаров');
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    options.categoryId,
    options.categorySlug,
    options.page,
    options.limit,
    options.search,
    options.sortBy,
    options.sortOrder,
  ]);

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
