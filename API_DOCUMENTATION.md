# API Документация - DoorHan Крым

## Обзор

Данная документация описывает API, который ожидает фронтенд приложения DoorHan Крым. API построен на REST принципах и использует JSON для обмена данными.

## Базовый URL

```
https://api.doorhan-crimea.ru
```

## Аутентификация

API использует Bearer токены для аутентификации. Токен должен передаваться в заголовке `Authorization`:

```
Authorization: Bearer <token>
```

## Структура ответов

### Успешный ответ

```typescript
{
  "success": true,
  "data": any,
  "message"?: string
}
```

### Ошибка

```typescript
{
  "success": false,
  "message": string,
  "errors"?: string[],
  "code"?: string
}
```

### Пагинированный ответ

```typescript
{
  "data": any[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

---

## 🏷️ Категории товаров

### GET /api/categories

Получить список всех категорий товаров.

**Параметры запроса:**
- `parentId` (optional) - ID родительской категории
- `isActive` (optional) - Фильтр по активности (true/false)
- `sortBy` (optional) - Сортировка: `name`, `sortOrder`, `productCount`
- `sortOrder` (optional) - Порядок сортировки: `asc`, `desc`

**Пример запроса:**
```bash
GET /api/categories?isActive=true&sortBy=name&sortOrder=asc
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ворота для дома",
      "description": "Секционные, распашные и откатные ворота для частных домов",
      "image": "/images/category-home.jpg",
      "color": "bg-blue-500",
      "hoverColor": "hover:bg-blue-600",
      "productCount": 24,
      "href": "/products?category=home",
      "slug": "vорота-для-дома",
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/categories/:id

Получить категорию по ID.

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ворота для дома",
    "description": "Секционные, распашные и откатные ворота для частных домов",
    "image": "/images/category-home.jpg",
    "color": "bg-blue-500",
    "hoverColor": "hover:bg-blue-600",
    "productCount": 24,
    "href": "/products?category=home",
    "slug": "vорота-для-дома",
    "isActive": true,
    "sortOrder": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🛍️ Товары

### GET /api/products

Получить список товаров с возможностью фильтрации и пагинации.

**Параметры запроса:**
- `category` (optional) - Фильтр по категории
- `minPrice` (optional) - Минимальная цена
- `maxPrice` (optional) - Максимальная цена
- `inStock` (optional) - Только в наличии (true/false)
- `isNew` (optional) - Только новинки (true/false)
- `isPopular` (optional) - Только популярные (true/false)
- `rating` (optional) - Минимальный рейтинг
- `search` (optional) - Поисковый запрос
- `sortBy` (optional) - Сортировка: `name`, `price`, `rating`, `createdAt`
- `sortOrder` (optional) - Порядок сортировки: `asc`, `desc`
- `page` (optional) - Номер страницы (по умолчанию: 1)
- `limit` (optional) - Количество товаров на странице (по умолчанию: 20)

**Пример запроса:**
```bash
GET /api/products?category=home&minPrice=10000&maxPrice=100000&sortBy=price&sortOrder=asc&page=1&limit=12
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Секционные ворота DoorHan 40",
        "title": "Секционные ворота",
        "description": "Надежные секционные ворота с утеплением для частных домов",
        "shortDescription": "Секционные ворота с автоматикой",
        "image": "/images/product-1.jpg",
        "images": [
          "/images/product-1.jpg",
          "/images/product-1-2.jpg",
          "/images/product-1-3.jpg"
        ],
        "features": ["Утепление", "Автоматика", "Гарантия 3 года"],
        "price": 125000,
        "oldPrice": 150000,
        "currency": "RUB",
        "category": "home",
        "categoryId": 1,
        "slug": "sektsionnye-vorota-doorhan-40",
        "sku": "DH-40-SEC",
        "inStock": true,
        "stockQuantity": 15,
        "isNew": true,
        "isPopular": true,
        "isFeatured": false,
        "rating": 4.8,
        "reviews": 24,
        "color": "bg-[#00205B]",
        "hoverColor": "hover:bg-[#00153E]",
        "specifications": [
          {
            "name": "Ширина",
            "value": "до 6 метров",
            "unit": "м"
          },
          {
            "name": "Высота",
            "value": "до 3 метров",
            "unit": "м"
          }
        ],
        "colors": [
          {
            "name": "Синий",
            "value": "blue",
            "hex": "#00205B"
          },
          {
            "name": "Белый",
            "value": "white",
            "hex": "#FFFFFF"
          }
        ],
        "relatedProducts": [2, 3, 4],
        "seoTitle": "Секционные ворота DoorHan 40 - купить в Крыму",
        "seoDescription": "Надежные секционные ворота с автоматикой. Доставка по Крыму.",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 159,
      "totalPages": 14
    }
  }
}
```

### GET /api/products/:id

Получить товар по ID.

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Секционные ворота DoorHan 40",
    "title": "Секционные ворота",
    "description": "Надежные секционные ворота с утеплением для частных домов",
    "shortDescription": "Секционные ворота с автоматикой",
    "image": "/images/product-1.jpg",
    "images": [
      "/images/product-1.jpg",
      "/images/product-1-2.jpg",
      "/images/product-1-3.jpg"
    ],
    "features": ["Утепление", "Автоматика", "Гарантия 3 года"],
    "price": 125000,
    "oldPrice": 150000,
    "currency": "RUB",
    "category": "home",
    "categoryId": 1,
    "slug": "sektsionnye-vorota-doorhan-40",
    "sku": "DH-40-SEC",
    "inStock": true,
    "stockQuantity": 15,
    "isNew": true,
    "isPopular": true,
    "isFeatured": false,
    "rating": 4.8,
    "reviews": 24,
    "color": "bg-[#00205B]",
    "hoverColor": "hover:bg-[#00153E]",
    "specifications": [
      {
        "name": "Ширина",
        "value": "до 6 метров",
        "unit": "м"
      }
    ],
    "colors": [
      {
        "name": "Синий",
        "value": "blue",
        "hex": "#00205B"
      }
    ],
    "relatedProducts": [2, 3, 4],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/search

Поиск товаров.

**Параметры запроса:**
- `q` (required) - Поисковый запрос
- `category` (optional) - Фильтр по категории
- Остальные параметры как в GET /api/products

**Пример запроса:**
```bash
GET /api/search?q=ворота&category=home&sortBy=rating&sortOrder=desc
```

---

## 🛒 Корзина

### GET /api/cart

Получить содержимое корзины.

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": "cart_12345",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "product": {
          "id": 1,
          "name": "Секционные ворота DoorHan 40",
          "price": 125000,
          "image": "/images/product-1.jpg"
        },
        "quantity": 2,
        "selectedColor": "blue",
        "selectedOptions": {
          "installation": true,
          "warranty": "extended"
        },
        "price": 125000,
        "totalPrice": 250000,
        "addedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "totalItems": 2,
    "totalPrice": 250000,
    "currency": "RUB",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/cart

Добавить товар в корзину.

**Тело запроса:**
```json
{
  "productId": 1,
  "quantity": 2,
  "selectedColor": "blue",
  "selectedOptions": {
    "installation": true,
    "warranty": "extended"
  }
}
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "productId": 1,
    "product": {
      "id": 1,
      "name": "Секционные ворота DoorHan 40",
      "price": 125000,
      "image": "/images/product-1.jpg"
    },
    "quantity": 2,
    "selectedColor": "blue",
    "selectedOptions": {
      "installation": true,
      "warranty": "extended"
    },
    "price": 125000,
    "totalPrice": 250000,
    "addedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/cart/:id

Обновить количество товара в корзине.

**Тело запроса:**
```json
{
  "quantity": 3
}
```

### DELETE /api/cart/:id

Удалить товар из корзины.

### DELETE /api/cart

Очистить всю корзину.

---

## 📦 Заказы

### POST /api/orders

Создать новый заказ.

**Тело запроса:**
```json
{
  "customerInfo": {
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan.petrov@example.com",
    "phone": "+7 (978) 123-45-67",
    "company": "ООО Рога и Копыта"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "selectedColor": "blue",
      "selectedOptions": {
        "installation": true
      }
    }
  ],
  "shippingAddress": {
    "street": "ул. Ленина, д. 10",
    "city": "Симферополь",
    "region": "Республика Крым",
    "postalCode": "295000",
    "country": "Россия"
  },
  "billingAddress": {
    "street": "ул. Ленина, д. 10",
    "city": "Симферополь",
    "region": "Республика Крым",
    "postalCode": "295000",
    "country": "Россия"
  },
  "notes": "Позвонить перед доставкой"
}
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "orderNumber": "ORD-2024-001",
    "customerInfo": {
      "firstName": "Иван",
      "lastName": "Петров",
      "email": "ivan.petrov@example.com",
      "phone": "+7 (978) 123-45-67",
      "company": "ООО Рога и Копыта"
    },
    "items": [
      {
        "id": 1,
        "productId": 1,
        "product": {
          "id": 1,
          "name": "Секционные ворота DoorHan 40",
          "price": 125000,
          "image": "/images/product-1.jpg"
        },
        "quantity": 2,
        "price": 125000,
        "totalPrice": 250000,
        "selectedColor": "blue",
        "selectedOptions": {
          "installation": true
        }
      }
    ],
    "status": "pending",
    "paymentStatus": "pending",
    "shippingAddress": {
      "street": "ул. Ленина, д. 10",
      "city": "Симферополь",
      "region": "Республика Крым",
      "postalCode": "295000",
      "country": "Россия"
    },
    "subtotal": 250000,
    "shippingCost": 5000,
    "tax": 0,
    "discount": 0,
    "total": 255000,
    "currency": "RUB",
    "notes": "Позвонить перед доставкой",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/orders

Получить список заказов пользователя.

### GET /api/orders/:id

Получить заказ по ID.

---

## 👤 Аутентификация

### POST /api/auth/login

Вход в систему.

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Иван",
      "lastName": "Петров",
      "phone": "+7 (978) 123-45-67",
      "role": "customer",
      "isActive": true,
      "avatar": "/images/avatar.jpg",
      "preferences": {
        "language": "ru",
        "currency": "RUB",
        "notifications": {
          "email": true,
          "sms": false,
          "push": true
        }
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/register

Регистрация нового пользователя.

**Тело запроса:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Иван",
  "lastName": "Петров",
  "phone": "+7 (978) 123-45-67"
}
```

### POST /api/auth/logout

Выход из системы.

### GET /api/auth/me

Получить информацию о текущем пользователе.

---

## 📝 Формы

### POST /api/contact

Отправить контактную форму.

**Тело запроса:**
```json
{
  "name": "Иван Петров",
  "email": "ivan.petrov@example.com",
  "phone": "+7 (978) 123-45-67",
  "company": "ООО Рога и Копыта",
  "subject": "Консультация по воротам",
  "message": "Здравствуйте! Интересуют секционные ворота для дома."
}
```

### POST /api/callback

Заказать обратный звонок.

**Тело запроса:**
```json
{
  "name": "Иван Петров",
  "phone": "+7 (978) 123-45-67",
  "preferredTime": "14:00-16:00",
  "message": "Хотел бы узнать о ценах на автоматику"
}
```

---

## 📊 Статистика

### GET /api/stats

Получить статистику сайта.

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 159,
    "totalCategories": 6,
    "totalOrders": 1247,
    "totalCustomers": 892,
    "monthlyRevenue": 12500000,
    "popularCategories": [
      {
        "category": {
          "id": 1,
          "name": "Ворота для дома",
          "slug": "vорота-для-дома"
        },
        "productCount": 24
      }
    ],
    "recentOrders": [
      {
        "id": 123,
        "orderNumber": "ORD-2024-001",
        "total": 255000,
        "status": "delivered",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 🔧 Утилиты

### POST /api/upload/image

Загрузка изображения.

**Content-Type:** `multipart/form-data`

**Параметры:**
- `image` - файл изображения

---

## 🚨 Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 422 | Ошибка валидации |
| 500 | Внутренняя ошибка сервера |

---

## 📋 Примеры использования в компонентах

### Получение категорий в CategoriesGrid

```typescript
import { apiClient } from '@/lib/api';
import { Category } from '@/types';

const CategoriesGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ... остальной код компонента
};
```

### Получение товаров в ProductsList

```typescript
import { apiClient } from '@/lib/api';
import { Product, ProductFilters } from '@/types';

const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({});

  const fetchProducts = async (newFilters: ProductFilters) => {
    try {
      const response = await apiClient.getProducts(newFilters);
      setProducts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  // ... остальной код компонента
};
```

### Добавление в корзину

```typescript
import { apiClient } from '@/lib/api';
import { AddToCartRequest } from '@/types';

const handleAddToCart = async (productId: number, quantity: number) => {
  try {
    const cartItem: AddToCartRequest = {
      productId,
      quantity,
      selectedColor: selectedColor,
      selectedOptions: selectedOptions
    };

    await apiClient.addToCart(cartItem);
    // Показать уведомление об успешном добавлении
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);
    // Показать ошибку пользователю
  }
};
```

---

## 🔄 Интеграция с React Query

Для эффективного кэширования и управления состоянием рекомендуется использовать React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Загрузка товаров
const { data: products, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => apiClient.getProducts(filters),
});

// Добавление в корзину
const queryClient = useQueryClient();

const addToCartMutation = useMutation({
  mutationFn: apiClient.addToCart,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  },
});
```

---

## 📱 Мобильная оптимизация

API поддерживает мобильные устройства и предоставляет оптимизированные данные:

- Сжатые изображения для мобильных устройств
- Пагинация для экономии трафика
- Кэширование для быстрой загрузки
- Offline-first подход с React Query

---

## 🔒 Безопасность

- Все API endpoints требуют HTTPS
- Bearer токены имеют ограниченное время жизни
- Валидация всех входящих данных
- Rate limiting для предотвращения злоупотреблений
- CORS настроен для домена приложения

---

## 📈 Мониторинг

API включает в себя:

- Логирование всех запросов
- Метрики производительности
- Алерты при ошибках
- Аналитика использования

---

*Документация обновлена: 2024-01-01*
