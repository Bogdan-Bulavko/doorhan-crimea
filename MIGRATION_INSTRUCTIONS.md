# Инструкции по миграции базы данных на сервере

## ⚠️ ВАЖНО: Резервное копирование

**Перед выполнением миграции обязательно создайте резервную копию базы данных!**

### Для SQLite (текущая база):

```bash
# 1. Остановите приложение (если оно запущено)
# 2. Создайте резервную копию
cp /path/to/prisma/dev.db /path/to/prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)

# Или экспортируйте в SQL
sqlite3 /path/to/prisma/dev.db ".dump" > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Для PostgreSQL (если используется на продакшене):

```bash
# Создайте дамп базы данных
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Выполнение миграции

### Вариант 1: Использование Prisma Migrate (рекомендуется)

```bash
# 1. Убедитесь, что вы находитесь в директории проекта
cd /path/to/doorhan-crimea-1

# 2. Примените миграцию
npx prisma migrate deploy

# Или для разработки:
npx prisma migrate dev --name add_seo_fields
```

### Вариант 2: Прямое выполнение SQL (если Prisma Migrate не используется)

#### Для SQLite:

```bash
# Выполните SQL скрипт
sqlite3 /path/to/prisma/dev.db < prisma/migration-add-seo-fields.sql
```

#### Для PostgreSQL:

```bash
# Выполните SQL скрипт через psql
psql -U username -d database_name -f prisma/migration-add-seo-fields.sql
```

**Примечание:** Для PostgreSQL может потребоваться адаптация SQL скрипта, так как синтаксис ALTER TABLE может отличаться.

### Вариант 3: Использование Prisma Studio (для проверки)

```bash
# Откройте Prisma Studio для визуальной проверки
npx prisma studio
```

## После миграции

1. **Обновите Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Проверьте, что все работает:**
   - Запустите приложение
   - Проверьте админку
   - Убедитесь, что новые поля отображаются

3. **Создайте служебные страницы:**
   ```bash
   # Запустите скрипт для создания служебных страниц
   npx tsx scripts/create-legal-pages.ts
   ```

## Что добавляет миграция

Миграция добавляет следующие поля:

1. **В таблицу `Category`:**
   - `robotsMeta` (TEXT, по умолчанию: 'index, follow')
   - `schemaMarkup` (TEXT, nullable)

2. **В таблицу `Product`:**
   - `robotsMeta` (TEXT, по умолчанию: 'index, follow')
   - `schemaMarkup` (TEXT, nullable)

3. **В таблицу `Page`:**
   - `robotsMeta` (TEXT, по умолчанию: 'index, follow')
   - `schemaMarkup` (TEXT, nullable)

## Откат миграции (если что-то пошло не так)

### Для SQLite:

```bash
# Восстановите из резервной копии
cp /path/to/prisma/dev.db.backup.YYYYMMDD_HHMMSS /path/to/prisma/dev.db
```

### Для PostgreSQL:

```bash
# Восстановите из дампа
psql -U username -d database_name < backup_YYYYMMDD_HHMMSS.sql
```

## Проверка успешности миграции

Выполните следующие SQL запросы для проверки:

```sql
-- Проверка структуры таблицы Category
PRAGMA table_info(Category);

-- Проверка структуры таблицы Product
PRAGMA table_info(Product);

-- Проверка структуры таблицы Page
PRAGMA table_info(Page);
```

Для PostgreSQL:
```sql
-- Проверка структуры таблицы Category
\d "Category"

-- Проверка структуры таблицы Product
\d "Product"

-- Проверка структуры таблицы Page
\d "Page"
```

## Контакты

Если возникли проблемы с миграцией, обратитесь к разработчику.

