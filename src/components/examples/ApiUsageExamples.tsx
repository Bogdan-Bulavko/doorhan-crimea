/**
 * Примеры использования API в компонентах
 * Этот файл демонстрирует, как интегрировать API вызовы в React компоненты
 */

'use client';

import { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  Category, 
  Product, 
  ProductFilters, 
  Cart, 
  AddToCartRequest,
  ContactFormData,
  CallbackFormData 
} from '@/types';

// ===== ПРИМЕР 1: CategoriesGrid с API =====
export const CategoriesGridWithAPI = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getCategories();
        setCategories(data);
      } catch (err: any) {
        setError('Ошибка загрузки категорий');
        console.error('Ошибка загрузки категорий:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Загрузка категорий...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {categories.map((category) => (
        <div key={category.id} className="bg-white rounded-2xl shadow-soft p-6">
          <h3 className="text-xl font-bold text-[#00205B] mb-2">
            {category.name}
          </h3>
          <p className="text-gray-600 mb-4">{category.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {category.productCount} товаров
            </span>
            <a 
              href={category.href}
              className="bg-[#F6A800] text-white px-4 py-2 rounded-lg hover:bg-[#ffb700] transition-colors"
            >
              Посмотреть
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== ПРИМЕР 2: ProductsList с React Query =====
export const ProductsListWithReactQuery = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Пример с React Query (закомментировано, так как пакет не установлен)
  // const {
  //   data: productsResponse,
  //   isLoading,
  //   error,
  //   refetch
  // } = useQuery({
  //   queryKey: ['products', filters],
  //   queryFn: () => apiClient.getProducts(filters),
  //   staleTime: 5 * 60 * 1000, // 5 минут
  // });

  // Альтернативная реализация без React Query
  const [productsResponse, setProductsResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchProducts = async (newFilters: ProductFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getProducts(newFilters);
      setProductsResponse(response);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSearch = (query: string) => {
    handleFilterChange({ search: query });
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    handleFilterChange({ sortBy: sortBy as any, sortOrder });
  };

  if (isLoading) return <div>Загрузка товаров...</div>;
  if (error) return <div>Ошибка загрузки товаров</div>;

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  return (
    <div>
      {/* Фильтры и поиск */}
      <div className="mb-8 bg-gray-50 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Поиск товаров..."
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800]"
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <select
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800]"
            onChange={(e) => handleFilterChange({ category: e.target.value })}
          >
            <option value="">Все категории</option>
            <option value="home">Ворота для дома</option>
            <option value="garage">Ворота для гаража</option>
            <option value="industrial">Промышленные ворота</option>
          </select>

          <select
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800]"
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleSortChange(sortBy, sortOrder as 'asc' | 'desc');
            }}
          >
            <option value="name-asc">По названию (А-Я)</option>
            <option value="name-desc">По названию (Я-А)</option>
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
            <option value="rating-desc">По рейтингу</option>
          </select>
        </div>
      </div>

      {/* Результаты */}
      <div className="mb-4">
        <p className="text-gray-600">
          Найдено товаров: <span className="font-semibold text-[#00205B]">{pagination?.total || 0}</span>
        </p>
      </div>

      {/* Сетка товаров */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      </div>

      {/* Пагинация */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination 
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => handleFilterChange({ page })}
        />
      )}
    </div>
  );
};

// ===== ПРИМЕР 3: ProductCard с добавлением в корзину =====
interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  // const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Пример с React Query (закомментировано)
  // const addToCartMutation = useMutation({
  //   mutationFn: (cartItem: AddToCartRequest) => apiClient.addToCart(cartItem),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['cart'] });
  //     // Показать уведомление об успешном добавлении
  //   },
  //   onError: (error: any) => {
  //     console.error('Ошибка добавления в корзину:', error);
  //     // Показать ошибку пользователю
  //   }
  // });

  // Альтернативная реализация без React Query
  const handleAddToCart = async () => {
    const cartItem: AddToCartRequest = {
      productId: product.id,
      quantity,
      selectedColor: selectedColor || undefined,
    };

    try {
      setIsAddingToCart(true);
      await apiClient.addToCart(cartItem);
      // Показать уведомление об успешном добавлении
    } catch (error: any) {
      console.error('Ошибка добавления в корзину:', error);
      // Показать ошибку пользователю
    } finally {
      setIsAddingToCart(false);
    }
  };


  return (
    <div className="bg-white rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Изображение товара */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {/* Бейджи */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.isNew && (
            <span className="bg-[#F6A800] text-white px-3 py-1 rounded-full text-xs font-medium">
              Новинка
            </span>
          )}
          {product.oldPrice && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Скидка
            </span>
          )}
        </div>

        {/* Рейтинг */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Контент товара */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-[#00205B] mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {product.shortDescription || product.description}
        </p>

        {/* Особенности */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.features.slice(0, 2).map((feature, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Цвета */}
        {product.colors.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Цвет:</p>
            <div className="flex space-x-2">
              {product.colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color.value ? 'border-[#F6A800] scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Количество */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Количество:</p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Цена и кнопка */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-[#00205B]">
              {product.price.toLocaleString('ru-RU')} ₽
            </div>
            {product.oldPrice && (
              <div className="text-sm text-gray-500 line-through">
                {product.oldPrice.toLocaleString('ru-RU')} ₽
              </div>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || !product.inStock}
            className="bg-[#F6A800] hover:bg-[#ffb700] disabled:bg-gray-400 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105 disabled:hover:scale-100"
          >
            {isAddingToCart ? (
              <span>Добавление...</span>
            ) : (
              <>
                <span>🛒</span>
                <span>В корзину</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== ПРИМЕР 4: Корзина с API =====
export const CartWithAPI = () => {
  // Пример с React Query (закомментировано)
  // const {
  //   data: cart,
  //   isLoading,
  //   error
  // } = useQuery({
  //   queryKey: ['cart'],
  //   queryFn: () => apiClient.getCart(),
  // });

  // const queryClient = useQueryClient();

  // const updateCartItemMutation = useMutation({
  //   mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
  //     apiClient.updateCartItem(itemId, quantity),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['cart'] });
  //   }
  // });

  // const removeFromCartMutation = useMutation({
  //   mutationFn: (itemId: number) => apiClient.removeFromCart(itemId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['cart'] });
  //   }
  // });

  // Альтернативная реализация без React Query
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cartData = await apiClient.getCart();
      setCart(cartData);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateCartItem = async (itemId: number, quantity: number) => {
    try {
      await apiClient.updateCartItem(itemId, quantity);
      fetchCart(); // Обновляем корзину
    } catch (error: any) {
      console.error('Ошибка обновления корзины:', error);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await apiClient.removeFromCart(itemId);
      fetchCart(); // Обновляем корзину
    } catch (error: any) {
      console.error('Ошибка удаления из корзины:', error);
    }
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, newQuantity);
    }
  };

  if (isLoading) return <div>Загрузка корзины...</div>;
  if (error) return <div>Ошибка загрузки корзины</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Корзина пуста</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#00205B] mb-8">Корзина</h2>
      
      <div className="space-y-6">
        {cart.items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-6">
              <img 
                src={item.product.image} 
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#00205B]">
                  {item.product.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.product.shortDescription || item.product.description}
                </p>
                {item.selectedColor && (
                  <p className="text-sm text-gray-500 mt-1">
                    Цвет: {item.selectedColor}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-[#00205B]">
                    {item.totalPrice.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.price.toLocaleString('ru-RU')} ₽ × {item.quantity}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Итого */}
      <div className="bg-white rounded-2xl shadow-soft p-6 mt-8">
        <div className="flex justify-between items-center text-xl font-bold text-[#00205B]">
          <span>Итого:</span>
          <span>{cart.totalPrice.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
          <span>Товаров: {cart.totalItems}</span>
        </div>
        
        <button className="w-full bg-[#F6A800] hover:bg-[#ffb700] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 mt-6 hover:scale-105">
          Оформить заказ
        </button>
      </div>
    </div>
  );
};

// ===== ПРИМЕР 5: Контактная форма =====
export const ContactFormWithAPI = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Пример с React Query (закомментировано)
  // const submitFormMutation = useMutation({
  //   mutationFn: (data: ContactFormData) => apiClient.submitContactForm(data),
  //   onSuccess: () => {
  //     // Показать уведомление об успешной отправке
  //     setFormData({
  //       name: '',
  //       email: '',
  //       phone: '',
  //       company: '',
  //       subject: '',
  //       message: ''
  //     });
  //   },
  //   onError: (error: any) => {
  //     console.error('Ошибка отправки формы:', error);
  //     // Показать ошибку пользователю
  //   }
  // });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await apiClient.submitContactForm(formData);
      
      // Показать уведомление об успешной отправке
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Ошибка отправки формы:', error);
      // Показать ошибку пользователю
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-soft p-8">
      <h2 className="text-2xl font-bold text-[#00205B] mb-8">Связаться с нами</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Телефон *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Компания
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тема *
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Сообщение *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#F6A800] hover:bg-[#ffb700] disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 mt-8 hover:scale-105 disabled:hover:scale-100"
      >
        {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
      </button>
    </form>
  );
};

// ===== ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ =====

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
      >
        Назад
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            page === currentPage
              ? 'bg-[#F6A800] text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
      >
        Вперед
      </button>
    </div>
  );
};

export default {
  CategoriesGridWithAPI,
  ProductsListWithReactQuery,
  ProductCard,
  CartWithAPI,
  ContactFormWithAPI,
  Pagination
};
