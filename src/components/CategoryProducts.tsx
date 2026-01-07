'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Grid, List, Star, Package } from 'lucide-react';
import { useState } from 'react';
import BreadCrumbs from './BreadCrumbs';
import RequestQuoteModal from './RequestQuoteModal';

interface Product {
  id: number;
  name: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  minPrice?: number | null;
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
  slug: string;
  images?: Array<{
    id: number;
    imageUrl: string;
    altText?: string;
    isMain: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  h1?: string;
  contentTop?: string;
  contentBottom?: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface ParentCategory {
  id: number;
  name: string;
  slug: string;
}

interface CategoryProductsProps {
  category: Category;
  products: Product[];
  subcategories?: Subcategory[];
  parentCategory?: ParentCategory | null;
}

const CategoryProducts = ({ category, products, subcategories = [], parentCategory }: CategoryProductsProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const getMainImage = (product: Product): string => {
    // Игнорируем дефолтные изображения из seed.js
    const defaultImages = ['/window.svg', '/globe.svg'];
    const hasValidMainImage = product.mainImageUrl && !defaultImages.includes(product.mainImageUrl);
    
    if (hasValidMainImage && product.mainImageUrl) return product.mainImageUrl;
    
    // Ищем основное изображение из таблицы ProductImage
    const mainImage = product.images?.find(img => img.isMain);
    if (mainImage && mainImage.imageUrl && !defaultImages.includes(mainImage.imageUrl)) {
      return mainImage.imageUrl;
    }
    
    // Берем первое изображение из таблицы
    const firstImage = product.images?.find(img => img.imageUrl && !defaultImages.includes(img.imageUrl));
    if (firstImage && firstImage.imageUrl) return firstImage.imageUrl;
    
    return '/images/placeholder.svg';
  };

  const formatPrice = (price: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getStatusBadges = (product: Product) => {
    const badges = [];
    if (product.isNew) badges.push({ label: 'Новинка', color: 'bg-green-100 text-green-800' });
    if (product.isPopular) badges.push({ label: 'Популярное', color: 'bg-blue-100 text-blue-800' });
    if (product.isFeatured) badges.push({ label: 'Рекомендуем', color: 'bg-purple-100 text-purple-800' });
    if (!product.inStock) badges.push({ label: 'Нет в наличии', color: 'bg-red-100 text-red-800' });
    return badges;
  };

  // Блок "Актуальная стоимость" временно скрыт, поэтому minPrice не используется
  // const priceValues = products
  //   .filter((product) => typeof product.price === 'number' && product.price > 0)
  //   .map((product) => product.price);
  // const minPrice = priceValues.length ? Math.min(...priceValues) : null;

  const sortedProducts = [...products].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
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
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хлебные крошки */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <BreadCrumbs 
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Категории', href: '/categories' },
              ...(parentCategory ? [
                { label: parentCategory.name, href: `/${parentCategory.slug}` }
              ] : []),
              { label: category.name, href: `/${category.slug}` }
            ]}
          />
        </div>
      </div>

      {/* Заголовок категории */}
      <section className="bg-gradient-to-r from-[#00205B] to-[#00153E] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/categories"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Назад к категориям
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {category.imageUrl && (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {category.h1 || category.name}
              </h1>
              {category.description && (
                <p className="text-xl text-white/90 leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ContentTop - контент сверху страницы категории */}
      {category.contentTop && category.contentTop.trim() !== '' && (
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-none [&_p]:mb-4 [&_p]:text-gray-700 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#00205B] [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#00205B] [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_a]:text-[#F6A800] [&_a]:hover:underline [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: category.contentTop }}
            />
          </div>
        </section>
      )}

      {/* Подкатегории */}
      {subcategories && subcategories.length > 0 && (
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#00205B] mb-6">Подкатегории</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subcategories.map((subcategory) => {
                const subcategoryPath = parentCategory 
                  ? `/${parentCategory.slug}/${subcategory.slug}`
                  : `/${category.slug}/${subcategory.slug}`;
                
                return (
                  <Link
                    key={subcategory.id}
                    href={subcategoryPath}
                    className="group bg-gray-50 rounded-xl p-6 hover:bg-[#00205B] hover:text-white transition-all duration-300 border border-gray-200 hover:border-[#00205B]"
                  >
                    {subcategory.imageUrl && (
                      <div className="relative w-full aspect-[4/3] mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={subcategory.imageUrl}
                          alt={subcategory.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-white">
                      {subcategory.name}
                    </h3>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600 group-hover:text-white/80 line-clamp-2">
                        {subcategory.description}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Дополнительные блоки: цена + мотивация */}
      <section className="bg-[#001C45] text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Блок "Актуальная стоимость" - скрыт */}
            {/* <div className="bg-white text-[#00205B] rounded-3xl p-6 shadow-xl hidden">
              <h2 className="text-2xl font-bold mb-4">Актуальная стоимость</h2>
              <p className="text-gray-600 mb-4">
                Мы рассчитываем цену под ваш объект и учитываем местные условия доставки и монтаж.
              </p>
              <div className="bg-[#F6A800]/10 border border-[#F6A800]/30 rounded-2xl p-5 mb-4">
                <p className="text-sm text-gray-500">Минимальная стоимость комплекта</p>
                <p className="text-3xl font-semibold mt-2">
                  {minPrice ? formatPrice(minPrice, products[0]?.currency) : 'По запросу'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Точная смета зависит от комплектации и города установки
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Отправьте параметры ворот — подготовим коммерческое предложение в течение рабочего дня.
              </p>
            </div> */}
            <div className="rounded-3xl border border-white/20 p-6 flex flex-col justify-between bg-gradient-to-br from-white/10 to-white/5">
              <div>
                <h2 className="text-2xl font-bold mb-3">Планируете заказ?</h2>
                <p className="text-white/80 mb-4">
                  Поможем выбрать комплектацию, предложим оптимальные сроки и закрепим менеджера в вашем городе.
                </p>
                <ul className="space-y-3 text-sm text-white/80">
                  <li>• Персональный расчёт стоимости</li>
                  <li>• Бесплатный выезд замерщика в пределах города</li>
                  <li>• Гарантия DoorHan и сервис в течение 5 лет</li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white text-[#00205B] px-5 py-3 rounded-2xl font-semibold hover:bg-[#F6A800] hover:text-white transition-colors"
                >
                  Запросить расчёт
                  <ArrowLeft className="rotate-180 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Панель управления */}
      <section className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Сортировка */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'createdAt')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
              >
                <option value="createdAt">По дате добавления</option>
                <option value="name">По названию</option>
                <option value="price">По цене</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={sortOrder === 'asc' ? 'По убыванию' : 'По возрастанию'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Переключатель вида */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-[#00205B] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#00205B] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="mt-4 text-sm text-gray-600">
            Найдено товаров: {products.length}
          </div>
        </div>
      </section>

      {/* Список товаров */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2 text-gray-600">Товары не найдены</h3>
              <p className="text-gray-500 mb-6">В данной категории пока нет товаров</p>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00205B] text-white rounded-lg hover:bg-[#001a4a] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Вернуться к категориям
              </Link>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col"
                >
                  {/* Изображение товара */}
                  <Link href={`/${category.slug}/${product.slug}`} className="relative aspect-[4/3] bg-gray-100 block flex-shrink-0">
                    <Image
                      src={getMainImage(product)}
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
                      {getStatusBadges(product).map((badge, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </Link>

                  {/* Информация о товаре */}
                  <div className="p-6 flex flex-col flex-grow">
                    <Link href={`/${category.slug}/${product.slug}`} className="block mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 hover:text-[#00205B] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {product.shortDescription && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Цена */}
                    {product.price > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {'minPrice' in product && product.minPrice
                            ? `от ${formatPrice(product.minPrice, product.currency)}`
                            : formatPrice(product.price, product.currency)}
                        </span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.oldPrice, product.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                    )}

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

                    {/* Кнопка */}
                    <Link
                      href={`/${category.slug}/${product.slug}`}
                      className="w-full bg-[#00205B] text-white py-3 px-4 rounded-lg hover:bg-[#001a4a] transition-colors text-center font-medium"
                    >
                      Подробнее
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ContentBottom - контент снизу страницы категории */}
      {category.contentBottom && category.contentBottom.trim() !== '' && (
        <section className="bg-white py-8 border-t">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-none [&_p]:mb-4 [&_p]:text-gray-700 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#00205B] [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#00205B] [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_a]:text-[#F6A800] [&_a]:hover:underline [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: category.contentBottom }}
            />
          </div>
        </section>
      )}

      {/* Модальное окно запроса расчёта */}
      <RequestQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </div>
  );
};

export default CategoryProducts;
