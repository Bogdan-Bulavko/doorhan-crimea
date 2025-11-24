-- Миграция: Добавление таблиц Menu и MenuItem для управления меню сайта

-- Создание таблицы Menu
CREATE TABLE IF NOT EXISTS "Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Создание таблицы MenuItem
CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "parentId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "target" TEXT DEFAULT '_self',
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Создание индексов для улучшения производительности
CREATE INDEX IF NOT EXISTS "MenuItem_menuId_idx" ON "MenuItem"("menuId");
CREATE INDEX IF NOT EXISTS "MenuItem_parentId_idx" ON "MenuItem"("parentId");
CREATE INDEX IF NOT EXISTS "MenuItem_isActive_idx" ON "MenuItem"("isActive");
CREATE INDEX IF NOT EXISTS "MenuItem_sortOrder_idx" ON "MenuItem"("sortOrder");

