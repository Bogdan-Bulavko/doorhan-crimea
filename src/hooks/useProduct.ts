'use client';

import { useState, useEffect } from 'react';

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
  price: string;
  oldPrice?: string | null;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: string;
  reviewsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  colors?: ProductColor[];
  createdAt: string;
  updatedAt: string;
}

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

export const useProduct = (id: string): UseProductResult => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 useProduct вызывается с ID:', id);

        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          // Сериализуем данные для корректной работы с Decimal
          const serializedProduct = {
            ...result.data,
            price: result.data.price.toString(),
            oldPrice: result.data.oldPrice?.toString() || null,
            rating: result.data.rating.toString(),
          };

          setProduct(serializedProduct);
        } else {
          setError(result.message || 'Ошибка при загрузке товара');
        }
      } catch (err) {
        setError('Ошибка сети при загрузке товара');
        console.error('Product fetch error:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
};
