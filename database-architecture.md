# Архитектура базы данных для админ панели DoorHan Крым

## Обзор проекта
Проект представляет собой интернет-магазин ворот и автоматики DoorHan с каталогом товаров, системой заказов и админ панелью для управления контентом.

## Основные сущности

### 1. Пользователи и роли
```sql
-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    avatar_url VARCHAR(500),
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Роли пользователей
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'manager');

-- Индексы для пользователей
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

### 2. Категории товаров
```sql
-- Таблица категорий
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    icon_name VARCHAR(100),
    color VARCHAR(7), -- hex цвет
    hover_color VARCHAR(7),
    slug VARCHAR(200) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    seo_title VARCHAR(200),
    seo_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для категорий
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);
```

### 3. Товары
```sql
-- Таблица товаров
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    title VARCHAR(300),
    description TEXT,
    short_description TEXT,
    main_image_url VARCHAR(500),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    slug VARCHAR(300) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'RUB',
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    seo_title VARCHAR(200),
    seo_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для товаров
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock ON products(in_stock);
CREATE INDEX idx_products_new ON products(is_new);
CREATE INDEX idx_products_popular ON products(is_popular);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);
```

### 4. Изображения товаров
```sql
-- Таблица изображений товаров
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для изображений
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_main ON product_images(is_main);
CREATE INDEX idx_product_images_sort ON product_images(sort_order);
```

### 5. Характеристики товаров
```sql
-- Таблица характеристик товаров
CREATE TABLE product_specifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    value VARCHAR(500) NOT NULL,
    unit VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для характеристик
CREATE INDEX idx_product_specs_product ON product_specifications(product_id);
CREATE INDEX idx_product_specs_sort ON product_specifications(sort_order);
```

### 6. Цвета товаров
```sql
-- Таблица цветов товаров
CREATE TABLE product_colors (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(50) NOT NULL,
    hex_color VARCHAR(7) NOT NULL,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для цветов
CREATE INDEX idx_product_colors_product ON product_colors(product_id);
CREATE INDEX idx_product_colors_sort ON product_colors(sort_order);
```

### 7. Корзина покупок
```sql
-- Таблица корзины
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100), -- для неавторизованных пользователей
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_color VARCHAR(50),
    selected_options JSONB,
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для корзины
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);
```

### 8. Заказы
```sql
-- Таблица заказов
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    customer_info JSONB NOT NULL, -- {firstName, lastName, email, phone, company}
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Статусы заказов
CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'processing', 
    'shipped', 'delivered', 'cancelled'
);

-- Статусы оплаты
CREATE TYPE payment_status AS ENUM (
    'pending', 'paid', 'failed', 'refunded'
);

-- Индексы для заказов
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at);
```

### 9. Позиции заказов
```sql
-- Таблица позиций заказов
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    selected_color VARCHAR(50),
    selected_options JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для позиций заказов
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### 10. Контактные формы
```sql
-- Таблица контактных форм
CREATE TABLE contact_forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(200),
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new', -- new, read, replied, closed
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для контактных форм
CREATE INDEX idx_contact_forms_status ON contact_forms(status);
CREATE INDEX idx_contact_forms_created ON contact_forms(created_at);
```

### 11. Заявки на обратный звонок
```sql
-- Таблица заявок на обратный звонок
CREATE TABLE callback_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    preferred_time VARCHAR(100),
    message TEXT,
    status VARCHAR(20) DEFAULT 'new', -- new, called, completed, cancelled
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для заявок
CREATE INDEX idx_callback_status ON callback_requests(status);
CREATE INDEX idx_callback_created ON callback_requests(created_at);
```

### 12. Настройки сайта
```sql
-- Таблица настроек сайта
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для настроек
CREATE INDEX idx_settings_key ON site_settings(key);
```

### 13. Статистика и аналитика
```sql
-- Таблица статистики
CREATE TABLE site_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_products INTEGER DEFAULT 0,
    total_categories INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    monthly_revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для статистики
CREATE INDEX idx_stats_date ON site_stats(date);
```

## API Endpoints для админ панели

### Управление пользователями
- `GET /api/admin/users` - список пользователей
- `POST /api/admin/users` - создание пользователя
- `PUT /api/admin/users/:id` - обновление пользователя
- `DELETE /api/admin/users/:id` - удаление пользователя

### Управление категориями
- `GET /api/admin/categories` - список категорий
- `POST /api/admin/categories` - создание категории
- `PUT /api/admin/categories/:id` - обновление категории
- `DELETE /api/admin/categories/:id` - удаление категории

### Управление товарами
- `GET /api/admin/products` - список товаров
- `POST /api/admin/products` - создание товара
- `PUT /api/admin/products/:id` - обновление товара
- `DELETE /api/admin/products/:id` - удаление товара
- `POST /api/admin/products/:id/images` - загрузка изображений
- `PUT /api/admin/products/:id/images/:imageId` - обновление изображения
- `DELETE /api/admin/products/:id/images/:imageId` - удаление изображения

### Управление заказами
- `GET /api/admin/orders` - список заказов
- `GET /api/admin/orders/:id` - детали заказа
- `PUT /api/admin/orders/:id/status` - изменение статуса заказа
- `PUT /api/admin/orders/:id/payment` - изменение статуса оплаты

### Управление формами
- `GET /api/admin/contact-forms` - список контактных форм
- `PUT /api/admin/contact-forms/:id/status` - изменение статуса
- `GET /api/admin/callback-requests` - список заявок на звонок
- `PUT /api/admin/callback-requests/:id/status` - изменение статуса

### Статистика и аналитика
- `GET /api/admin/stats/dashboard` - общая статистика
- `GET /api/admin/stats/products` - статистика по товарам
- `GET /api/admin/stats/orders` - статистика по заказам
- `GET /api/admin/stats/revenue` - статистика по выручке

## Функции и триггеры

### Автоматическое обновление updated_at
```sql
-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Подсчет товаров в категориях
```sql
-- Функция для подсчета товаров в категории
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE categories 
        SET product_count = (
            SELECT COUNT(*) 
            FROM products 
            WHERE category_id = NEW.category_id AND in_stock = true
        )
        WHERE id = NEW.category_id;
    END IF;
    
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        UPDATE categories 
        SET product_count = (
            SELECT COUNT(*) 
            FROM products 
            WHERE category_id = OLD.category_id AND in_stock = true
        )
        WHERE id = OLD.category_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Триггер для автоматического подсчета товаров
CREATE TRIGGER update_category_product_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION update_category_product_count();
```

## Индексы для производительности

### Составные индексы
```sql
-- Индексы для поиска товаров
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('russian', name || ' ' || description));
CREATE INDEX idx_products_category_stock ON products(category_id, in_stock);
CREATE INDEX idx_products_price_range ON products(price) WHERE in_stock = true;

-- Индексы для заказов
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_date_status ON orders(created_at, status);

-- Индексы для корзины
CREATE INDEX idx_cart_user_product ON cart_items(user_id, product_id);
CREATE INDEX idx_cart_session_product ON cart_items(session_id, product_id);
```

## Резервное копирование и восстановление

### Ежедневные бэкапы
```bash
# Скрипт для ежедневного бэкапа
pg_dump -h localhost -U doorhan_admin -d doorhan_crimea > backup_$(date +%Y%m%d).sql
```

### Восстановление из бэкапа
```bash
# Восстановление из бэкапа
psql -h localhost -U doorhan_admin -d doorhan_crimea < backup_20241201.sql
```

## Мониторинг и логирование

### Таблица логов
```sql
-- Таблица логов админ панели
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для логов
CREATE INDEX idx_admin_logs_user ON admin_logs(user_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);
```

## Безопасность

### Ограничения доступа
```sql
-- Создание роли для админ панели
CREATE ROLE doorhan_admin;
GRANT ALL PRIVILEGES ON DATABASE doorhan_crimea TO doorhan_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doorhan_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO doorhan_admin;

-- Создание роли для чтения (для API)
CREATE ROLE doorhan_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO doorhan_readonly;
```

## Масштабирование

### Партиционирование для больших таблиц
```sql
-- Партиционирование логов по месяцам
CREATE TABLE admin_logs_y2024m01 PARTITION OF admin_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE admin_logs_y2024m02 PARTITION OF admin_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### Репликация для чтения
```sql
-- Настройка репликации для отчетов
-- (требует настройки на уровне PostgreSQL)
```

## Заключение

Данная архитектура базы данных обеспечивает:

1. **Масштабируемость** - структура позволяет легко добавлять новые функции
2. **Производительность** - оптимизированные индексы и запросы
3. **Безопасность** - разделение ролей и логирование действий
4. **Надежность** - автоматические триггеры и резервное копирование
5. **Гибкость** - JSONB поля для хранения дополнительных данных

Архитектура готова для реализации админ панели с полным функционалом управления интернет-магазином DoorHan Крым.
