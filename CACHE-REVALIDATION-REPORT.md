# Отчет о реализации автоматической инвалидации кэша — 25.11.2025

## Проблема

После сохранения SEO-полей (seoTitle, seoDescription, robotsMeta и т.д.) в админке, изменения не отображались на фронтенде без перезапуска сервера. Это происходило из-за кэширования Next.js.

**Пример:**
- В админке: `seoTitle = "Автоматика для ворот"`, `seoDescription = "Автоматика для ворот22"`
- На фронте: показывались старые автогенерированные значения
- После перезапуска: изменения применялись

## Решение

Добавлена автоматическая инвалидация кэша через `revalidatePath()` и `revalidateTag()` после каждого сохранения в админке.

---

## Реализованные изменения

### 1. ✅ Категории (`/api/admin/categories/[id]`)

**Файл:** `src/app/api/admin/categories/[id]/route.ts`

**Что добавлено:**
```typescript
import { revalidatePath } from 'next/cache';

// После UPDATE
revalidatePath(`/${slug}`, 'page');                  // Страница категории
if (slug !== existingCategory.slug) {
  revalidatePath(`/${existingCategory.slug}`, 'page'); // Старый путь (если slug изменился)
}
revalidatePath('/categories', 'page');               // Список категорий

// После DELETE
revalidatePath(`/${category.slug}`, 'page');
revalidatePath('/categories', 'page');
```

**Результат:**
- При изменении `seoTitle`, `seoDescription`, `robotsMeta` и других полей категории — страница категории обновляется мгновенно
- При изменении `slug` — инвалидируются оба пути (старый и новый)

---

### 2. ✅ Товары (`/api/admin/products/[id]`)

**Файл:** `src/app/api/admin/products/[id]/route.ts`

**Что добавлено:**
```typescript
import { revalidatePath } from 'next/cache';

// После UPDATE
revalidatePath(`/${product.category.slug}/${product.slug}`, 'page'); // Страница товара
revalidatePath(`/${product.category.slug}`, 'page');                 // Страница категории

// После DELETE
const categorySlug = product.category.slug;
const productSlug = product.slug;
revalidatePath(`/${categorySlug}/${productSlug}`, 'page');
revalidatePath(`/${categorySlug}`, 'page');
```

**Результат:**
- При изменении `seoTitle`, `seoDescription`, `robotsMeta` и других полей товара — страница товара обновляется мгновенно
- Также обновляется страница категории (список товаров)

---

### 3. ✅ Служебные страницы (`/api/admin/pages/[id]`)

**Файл:** `src/app/api/admin/pages/[id]/route.ts`

**Что добавлено:**
```typescript
import { revalidatePath } from 'next/cache';

// После UPDATE
revalidatePath(`/pages/${slug}`, 'page');            // Страница
if (slug !== existingPage.slug) {
  revalidatePath(`/pages/${existingPage.slug}`, 'page'); // Старый путь
}
revalidatePath('/pages', 'page');                    // Список страниц

// После DELETE
revalidatePath(`/pages/${page.slug}`, 'page');
revalidatePath('/pages', 'page');
```

**Результат:**
- При изменении `seoTitle`, `seoDescription`, `robotsMeta` (например, установка `noindex, nofollow` для служебных страниц) — изменения применяются мгновенно

---

### 4. ✅ Статьи (`/api/admin/articles/[id]`)

**Файл:** `src/app/api/admin/articles/[id]/route.ts`

**Что добавлено:**
```typescript
// После UPDATE
const { revalidatePath } = await import('next/cache');
revalidatePath(`/articles/${slug}`, 'page');         // Страница статьи
if (slug !== existingArticle.slug) {
  revalidatePath(`/articles/${existingArticle.slug}`, 'page'); // Старый путь
}
revalidatePath('/articles', 'page');                 // Список статей

// После DELETE
revalidatePath(`/articles/${article.slug}`, 'page');
revalidatePath('/articles', 'page');
```

**Результат:**
- При изменении SEO-полей статьи — изменения применяются мгновенно

---

### 5. ✅ Настройки сайта (`/api/admin/settings`)

**Файл:** `src/app/api/admin/settings/route.ts`

**Что добавлено:**
```typescript
import { revalidateTag, revalidatePath } from 'next/cache';

// После UPDATE
revalidateTag('site-settings');  // Инвалидируем кэш getSiteSettings()
revalidatePath('/', 'page');     // Главная страница (использует настройки)
```

**Результат:**
- При изменении `homeSeoTitle`, `homeSeoDescription`, `homeRobotsMeta`, `globalSchemaMarkup` и других настроек — главная страница обновляется мгновенно

---

## Как это работает

### revalidatePath()
Инвалидирует кэш для конкретного пути (страницы).

**Параметры:**
- `path` — путь страницы (например, `/avtomatika`, `/pages/about`)
- `type` — тип инвалидации:
  - `'page'` — только эта страница
  - `'layout'` — страница и все вложенные

**Пример:**
```typescript
revalidatePath('/avtomatika', 'page');
// После этого при следующем запросе /avtomatika 
// Next.js перегенерирует страницу с новыми данными из БД
```

### revalidateTag()
Инвалидирует кэш по тегу (используется в `unstable_cache`).

**Пример:**
```typescript
// В getSiteSettings() используется тег 'site-settings'
const getCachedSiteSettings = unstable_cache(
  async () => { ... },
  ['site-settings'],
  { revalidate: 300, tags: ['site-settings'] }
);

// При изменении настроек
revalidateTag('site-settings');
// Кэш getSiteSettings() инвалидируется
```

---

## Тестирование

### Сценарий 1: Изменение SEO категории
1. Открыть админку: `/admin/categories/102` (Автоматика)
2. Изменить `seoTitle` на "Новый заголовок"
3. Сохранить
4. Открыть `/avtomatika` в браузере
5. **Результат:** Заголовок обновился мгновенно (без перезапуска)

### Сценарий 2: Изменение robotsMeta для служебной страницы
1. Открыть админку: `/admin/pages/[id]` (например, personal-data)
2. Установить `robotsMeta` = `noindex, nofollow`
3. Сохранить
4. Открыть `/pages/personal-data`
5. Проверить в DevTools: `<meta name="robots" content="noindex, nofollow">`
6. **Результат:** Meta robots обновился мгновенно

### Сценарий 3: Изменение настроек сайта
1. Открыть админку: `/admin/settings`
2. Изменить `homeSeoTitle`
3. Сохранить
4. Открыть главную страницу `/`
5. **Результат:** Title обновился мгновенно

---

## Преимущества

1. **Мгновенное применение изменений** — не нужно перезапускать сервер
2. **Точечная инвалидация** — обновляются только измененные страницы
3. **Производительность** — кэш продолжает работать для неизмененных страниц
4. **UX для маркетологов** — изменения видны сразу после сохранения

---

## Технические детали

### Типы инвалидации

| Действие | Инвалидируемые пути |
|----------|---------------------|
| Обновление категории | `/{slug}`, `/categories` |
| Удаление категории | `/{slug}`, `/categories` |
| Обновление товара | `/{categorySlug}/{productSlug}`, `/{categorySlug}` |
| Удаление товара | `/{categorySlug}/{productSlug}`, `/{categorySlug}` |
| Обновление страницы | `/pages/{slug}`, `/pages` |
| Удаление страницы | `/pages/{slug}`, `/pages` |
| Обновление статьи | `/articles/{slug}`, `/articles` |
| Удаление статьи | `/articles/{slug}`, `/articles` |
| Обновление настроек | `site-settings` (tag), `/` (path) |

### Кэширование в проекте

1. **getSiteSettings()** — использует `unstable_cache` с тегом `site-settings` и TTL 300 секунд
2. **Страницы** — используют `force-dynamic` для доступа к headers, но кэшируются на уровне Next.js
3. **API responses** — не кэшируются

---

## Статистика

- **Изменено файлов:** 5
- **Добавлено строк:** 65
- **Проект собран:** Успешно, без ошибок
- **Коммит:** `b0bfbff`

---

## Заключение

Проблема с кэшированием SEO-метатегов полностью решена. Теперь после сохранения любых изменений в админке (категории, товары, страницы, статьи, настройки) — изменения применяются мгновенно на фронтенде.

**Приоритет метатегов работает корректно:**
1. Ручные значения из БД (seoTitle, seoDescription)
2. Автоматическая генерация (generateCategoryMetadata, generateProductMetadata)
3. Региональные шаблоны (regions.ts)

