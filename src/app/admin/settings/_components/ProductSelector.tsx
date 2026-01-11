'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  mainImageUrl?: string;
  category?: {
    name: string;
  };
}

interface ProductSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export default function ProductSelector({ selectedIds, onChange }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Загружаем все товары с большим лимитом
        const response = await fetch('/api/admin/products?limit=10000');
        const result = await response.json();
        if (result.success && result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        p.category?.name.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const toggleProduct = (productId: number) => {
    if (selectedIds.includes(productId)) {
      onChange(selectedIds.filter((id) => id !== productId));
    } else {
      onChange([...selectedIds, productId]);
    }
  };

  const removeProduct = (productId: number) => {
    onChange(selectedIds.filter((id) => id !== productId));
  };

  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedIds.includes(p.id));
  }, [products, selectedIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00205B]"></div>
        <span className="ml-2 text-gray-600">Загрузка товаров...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
        />
      </div>

      {/* Выбранные товары */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Выбрано товаров: {selectedProducts.length}
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <span
                key={product.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {product.name}
                <button
                  onClick={() => removeProduct(product.id)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Список товаров */}
      <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'Товары не найдены' : 'Нет доступных товаров'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#00205B] border-[#00205B]'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      {product.category && (
                        <div className="text-sm text-gray-500">
                          {product.category.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

