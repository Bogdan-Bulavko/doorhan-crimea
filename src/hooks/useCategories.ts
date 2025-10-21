'use client';

import { useState, useEffect } from 'react';

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
  products?: any[];
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
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options.includeProducts) params.append('includeProducts', 'true');
        if (options.parentId !== undefined) {
          params.append('parentId', options.parentId?.toString() || 'null');
        }
        if (options.slug) params.append('slug', options.slug);

        const response = await fetch(`/api/categories?${params}`);
        const result = await response.json();

        if (result.success) {
          setCategories(result.data);
        } else {
          setError(result.message || 'Ошибка при загрузке категорий');
        }
      } catch (err) {
        setError('Ошибка сети при загрузке категорий');
        console.error('Categories fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
