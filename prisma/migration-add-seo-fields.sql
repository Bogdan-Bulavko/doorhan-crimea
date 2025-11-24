-- Миграция: Добавление SEO полей (robotsMeta, schemaMarkup) в таблицы Category, Product, Page
-- Дата создания: 2024-11-21
-- 
-- ВАЖНО: Перед выполнением на сервере сделайте резервную копию базы данных!
-- 
-- Команда для резервного копирования SQLite:
-- cp /path/to/database.db /path/to/database.db.backup
--
-- Или для экспорта:
-- sqlite3 /path/to/database.db ".dump" > backup.sql

-- Добавляем поле robotsMeta в таблицу Category
ALTER TABLE "Category" ADD COLUMN "robotsMeta" TEXT DEFAULT 'index, follow';

-- Добавляем поле schemaMarkup в таблицу Category
ALTER TABLE "Category" ADD COLUMN "schemaMarkup" TEXT;

-- Добавляем поле robotsMeta в таблицу Product
ALTER TABLE "Product" ADD COLUMN "robotsMeta" TEXT DEFAULT 'index, follow';

-- Добавляем поле schemaMarkup в таблицу Product
ALTER TABLE "Product" ADD COLUMN "schemaMarkup" TEXT;

-- Добавляем поле robotsMeta в таблицу Page
ALTER TABLE "Page" ADD COLUMN "robotsMeta" TEXT DEFAULT 'index, follow';

-- Добавляем поле schemaMarkup в таблицу Page
ALTER TABLE "Page" ADD COLUMN "schemaMarkup" TEXT;

-- Обновляем существующие записи, устанавливая значение по умолчанию для robotsMeta
UPDATE "Category" SET "robotsMeta" = 'index, follow' WHERE "robotsMeta" IS NULL;
UPDATE "Product" SET "robotsMeta" = 'index, follow' WHERE "robotsMeta" IS NULL;
UPDATE "Page" SET "robotsMeta" = 'index, follow' WHERE "robotsMeta" IS NULL;

