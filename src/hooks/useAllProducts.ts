'use client';

import { useState, useEffect, useMemo } from 'react';
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
  price: number;
  oldPrice?: number | null;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  colors?: ProductColor[];
  createdAt: string;
  updatedAt: string;
}

interface UseAllProductsOptions {
  categorySlug?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UseAllProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  totalCount: number;
}

export const useAllProducts = (
  options: UseAllProductsOptions = {}
): UseAllProductsResult => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Debounce для поиска
  const debouncedSearch = useDebounce(options.search || '', 300);

  // Кэширование всех товаров
  const productsCache = useCache<Product[]>(10 * 60 * 1000); // 10 минут кэш
  const countCache = useCache<number>(10 * 60 * 1000); // 10 минут кэш

  // Загружаем все товары один раз
  useEffect(() => {
    let isMounted = true;

    const fetchAllProducts = async () => {
      if (!isMounted) return;

      // Проверяем кэш
      const cachedProducts = productsCache.get('all-products');
      const cachedTotalCount = countCache.get('total-products-count');
      if (cachedProducts) {
        setAllProducts(cachedProducts);
        setTotalProductsCount(cachedTotalCount || cachedProducts.length);
        setInitialLoadComplete(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/products?limit=1000', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!isMounted) return;

        if (result.success) {
          const products = result.data;
          const totalCount = result.pagination?.total || products.length;
          setAllProducts(products);
          setTotalProductsCount(totalCount);
          productsCache.set('all-products', products);
          countCache.set('total-products-count', totalCount);
          setInitialLoadComplete(true);
        } else {
          setError(result.message || 'Ошибка при загрузке товаров');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Ошибка сети при загрузке товаров');
        console.error('All products fetch error:', err);
        setAllProducts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllProducts();

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Фильтруем и сортируем товары на клиенте
  const filteredProducts = useMemo(() => {
    if (!initialLoadComplete) return [];

    let filtered = [...allProducts];

    // Фильтр по категории
    if (options.categorySlug && options.categorySlug !== 'all') {
      filtered = filtered.filter(
        (product) => product.category?.slug === options.categorySlug
      );
    }

    // Поиск только по названию товара
    if (debouncedSearch && debouncedSearch.trim() !== '') {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((product) => {
        const productNameMatch = product.name
          .toLowerCase()
          .includes(searchLower);
        return productNameMatch;
      });
    }

    // Сортировка
    if (options.sortBy) {
      filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (options.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }

        if (options.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    return filtered;
  }, [
    allProducts,
    options.categorySlug,
    debouncedSearch,
    options.sortBy,
    options.sortOrder,
    initialLoadComplete,
  ]);

  // Пагинация
  const paginatedProducts = useMemo(() => {
    const page = options.page || 1;
    const limit = options.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, options.page, options.limit]);

  const pagination = useMemo(() => {
    const page = options.page || 1;
    const limit = options.limit || 12;
    const total = filteredProducts.length;
    const pages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      pages,
    };
  }, [filteredProducts.length, options.page, options.limit]);

  return {
    products: paginatedProducts,
    loading: loading || !initialLoadComplete,
    error,
    pagination,
    totalCount: totalProductsCount,
  };
};
