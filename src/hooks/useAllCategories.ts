'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCache } from './useCache';

interface Product {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  iconName?: string;
  color?: string;
  hoverColor?: string;
  slug: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  contentTop?: string | null;
  contentBottom?: string | null;
  products?: Product[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface UseAllCategoriesOptions {
  includeProducts?: boolean;
  parentId?: number | null;
  slug?: string;
}

export const useAllCategories = (options: UseAllCategoriesOptions = {}) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Кэширование всех категорий
  const cache = useCache<Category[]>(10 * 60 * 1000); // 10 минут кэш

  // Загружаем все категории один раз
  useEffect(() => {
    let isMounted = true;

    const fetchAllCategories = async () => {
      if (!isMounted) return;

      // Проверяем кэш
      const cachedCategories = cache.get('all-categories');
      if (cachedCategories) {
        setAllCategories(cachedCategories);
        setInitialLoadComplete(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/categories', {
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
          const categories = result.data;
          setAllCategories(categories);
          cache.set('all-categories', categories);
          setInitialLoadComplete(true);
        } else {
          setError(result.message || 'Ошибка при загрузке категорий');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Ошибка сети при загрузке категорий');
        console.error('All categories fetch error:', err);
        setAllCategories([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllCategories();

    return () => {
      isMounted = false;
    };
  }, [cache]); // Добавляем cache в зависимости

  // Фильтруем категории на клиенте
  const filteredCategories = useMemo(() => {
    if (!initialLoadComplete) return [];

    let filtered = [...allCategories];

    // Фильтр по parentId
    if (options.parentId !== undefined) {
      filtered = filtered.filter((category) => {
        if (options.parentId === null) {
          return category.parentId === null;
        }
        return category.parentId === options.parentId;
      });
    }

    // Фильтр по slug
    if (options.slug) {
      filtered = filtered.filter((category) => category.slug === options.slug);
    }

    // Фильтр только активных категорий
    filtered = filtered.filter((category) => category.isActive);

    // Сортировка по sortOrder
    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    return filtered;
  }, [allCategories, options.parentId, options.slug, initialLoadComplete]);

  return {
    categories: filteredCategories,
    loading: loading || !initialLoadComplete,
    error,
  };
};

export const useCategory = (slug: string) => {
  return useAllCategories({ slug });
};

export const useMainCategories = () => {
  return useAllCategories({ parentId: null });
};

export const useSubCategories = (parentId: number) => {
  return useAllCategories({ parentId });
};
