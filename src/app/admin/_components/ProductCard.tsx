'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Trash2, 
  Eye, 
  Star, 
  Package, 
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';

interface Product {
  id: number;
  name: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  mainImageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
  images?: Array<{
    id: number;
    imageUrl: string;
    altText?: string;
    isMain: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
  onDelete: (id: number) => Promise<void>;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useAlert();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить товар "${product.name}"? Это действие нельзя отменить.`
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(product.id);
      showSuccess('Товар удален', `Товар "${product.name}" успешно удален`);
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      showError('Ошибка удаления', 'Не удалось удалить товар. Попробуйте еще раз.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getMainImage = () => {
    if (product.mainImageUrl) return product.mainImageUrl;
    const mainImage = product.images?.find(img => img.isMain);
    if (mainImage) return mainImage.imageUrl;
    const firstImage = product.images?.[0]?.imageUrl;
    const finalSrc = firstImage || '/images/placeholder.svg';
    
    // Временное логирование для отладки
    console.log('🔍 ProductCard image debug:', {
      productName: product.name,
      mainImageUrl: product.mainImageUrl,
      imagesCount: product.images?.length || 0,
      images: product.images,
      finalSrc
    });
    
    return finalSrc;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: product.currency,
    }).format(price);
  };

  const getStatusBadges = () => {
    const badges = [];
    if (product.isNew) badges.push({ label: 'Новинка', color: 'bg-green-100 text-green-800' });
    if (product.isPopular) badges.push({ label: 'Популярное', color: 'bg-blue-100 text-blue-800' });
    if (product.isFeatured) badges.push({ label: 'Рекомендуем', color: 'bg-purple-100 text-purple-800' });
    if (!product.inStock) badges.push({ label: 'Нет в наличии', color: 'bg-red-100 text-red-800' });
    return badges;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      {/* Изображение товара */}
      <div className="relative aspect-[4/3] bg-gray-100 block cursor-pointer" onClick={() => window.location.href = `/admin/products/${product.id}`}>
        <Image
          src={getMainImage()}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.svg';
          }}
        />
        
        {/* Статусные бейджи */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {getStatusBadges().map((badge, index) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Кнопки действий */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <a
              href={`/categories/products/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
              title="Посмотреть на сайте"
            >
              <Eye className="h-4 w-4 text-gray-600" />
            </a>
            <Link
              href={`/admin/products/${product.id}`}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
              title="Редактировать"
            >
              <Edit3 className="h-4 w-4 text-blue-600" />
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Удалить"
            >
              <Trash2 className={`h-4 w-4 ${isDeleting ? 'text-gray-400' : 'text-red-600'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Информация о товаре */}
      <div className="p-6">
        {/* Название и категория */}
        <div className="mb-3">
          <Link href={`/admin/products/${product.id}`} className="block cursor-pointer hover:text-[#00205B] transition-colors">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 mb-1">
              {product.name}
            </h3>
          </Link>
          {product.category && (
            <div className="flex items-center text-sm text-gray-500">
              <Tag className="h-3 w-3 mr-1" />
              {product.category.name}
            </div>
          )}
        </div>

        {/* Описание */}
        {product.shortDescription && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {product.shortDescription}
          </p>
        )}

        {/* Цена */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            <span>{Number(product.rating).toFixed(1)} ({product.reviewsCount})</span>
          </div>
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            <span>{product.stockQuantity} шт.</span>
          </div>
        </div>

        {/* Даты */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Создан: {new Date(product.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            <span>ID: {product.id}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
