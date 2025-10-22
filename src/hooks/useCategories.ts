'use client';

import { useState, useEffect } from 'react';

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
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

interface UseCategoriesOptions {
  includeProducts?: boolean;
  parentId?: number | null;
  slug?: string;
}

export const useCategories = (options: UseCategoriesOptions = {}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    const fetchCategories = async () => {
      if (!isMounted) return;
      
      let timeoutId: NodeJS.Timeout | null = null;
      
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options.includeProducts) params.append('includeProducts', 'true');
        if (options.parentId !== undefined) {
          params.append('parentId', options.parentId?.toString() || 'null');
        }
        if (options.slug) params.append('slug', options.slug);

        // Добавляем таймаут для запроса
        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          if (!controller.signal.aborted) {
            controller.abort();
          }
        }, 5000); // 5 секунд таймаут

        const response = await fetch(`/api/categories?${params}`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Очищаем таймаут только если запрос прошел успешно
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          if (response.status === 404 && retryCount < maxRetries) {
            retryCount++;
            console.warn(`API категорий не найден, попытка ${retryCount}/${maxRetries}`);
            // Задержка перед повтором
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (isMounted) {
              return fetchCategories();
            }
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!isMounted) return;

        if (result.success) {
          setCategories(result.data);
        } else {
          setError(result.message || 'Ошибка при загрузке категорий');
        }
      } catch (err) {
        if (!isMounted) return;
        
        // Очищаем таймаут в случае ошибки
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Превышено время ожидания запроса');
        } else {
          setError('Ошибка сети при загрузке категорий');
        }
        console.error('Categories fetch error:', err);
        setCategories([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [options.includeProducts, options.parentId, options.slug]);

  return { categories, loading, error };
};

export const useCategory = (slug: string) => {
  return useCategories({ slug });
};

export const useMainCategories = () => {
  return useCategories({ parentId: null });
};

export const useSubCategories = (parentId: number) => {
  return useCategories({ parentId });
};
