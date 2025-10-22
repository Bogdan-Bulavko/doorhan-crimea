import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function createSqlDump() {
  try {
    console.log('🔄 Создание SQL дампа...');

    // Получаем все данные
    const categories = await prisma.category.findMany();
    const products = await prisma.product.findMany();
    const productImages = await prisma.productImage.findMany();
    const productSpecs = await prisma.productSpecification.findMany();
    const productColors = await prisma.productColor.findMany();
    const users = await prisma.user.findMany();
    const orders = await prisma.order.findMany();
    const orderItems = await prisma.orderItem.findMany();
    const contactForms = await prisma.contactForm.findMany();
    const callbackRequests = await prisma.callbackRequest.findMany();
    const siteSettings = await prisma.siteSetting.findMany();
    const adminLogs = await prisma.adminLog.findMany();

    // Создаем SQL дамп
    let sqlDump = `-- SQL Dump for DoorHan Crimea Database
-- Generated: ${new Date().toISOString()}
-- Version: 1.0.0

-- ===========================================
-- SCHEMA CREATION
-- ===========================================

-- Categories
CREATE TABLE IF NOT EXISTS "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "iconName" TEXT,
    "color" TEXT,
    "hoverColor" TEXT,
    "slug" TEXT NOT NULL UNIQUE,
    "parentId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "shortDescription" TEXT,
    "mainImageUrl" TEXT,
    "categoryId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "sku" TEXT UNIQUE,
    "price" DECIMAL NOT NULL,
    "oldPrice" DECIMAL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Product Images
CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Product Specifications
CREATE TABLE IF NOT EXISTS "ProductSpecification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Product Colors
CREATE TABLE IF NOT EXISTS "ProductColor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "hexColor" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Users
CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "preferences" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL UNIQUE,
    "userId" INTEGER,
    "customerInfo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "shippingAddress" TEXT NOT NULL,
    "billingAddress" TEXT,
    "subtotal" DECIMAL NOT NULL,
    "shippingCost" DECIMAL NOT NULL DEFAULT 0,
    "tax" DECIMAL NOT NULL DEFAULT 0,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Order Items
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    "totalPrice" DECIMAL NOT NULL,
    "selectedColor" TEXT,
    "selectedOptions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Contact Forms
CREATE TABLE IF NOT EXISTS "ContactForm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Callback Requests
CREATE TABLE IF NOT EXISTS "CallbackRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferredTime" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Site Settings
CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- Admin Logs
CREATE TABLE IF NOT EXISTS "AdminLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "tableName" TEXT,
    "recordId" INTEGER,
    "oldValues" TEXT,
    "newValues" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================================
-- DATA INSERTION
-- ===========================================

`;

    // Добавляем данные категорий
    for (const category of categories) {
      sqlDump += `INSERT INTO "Category" ("id", "name", "description", "imageUrl", "iconName", "color", "hoverColor", "slug", "parentId", "isActive", "sortOrder", "seoTitle", "seoDescription", "createdAt", "updatedAt") VALUES (${category.id}, '${category.name.replace(/'/g, "''")}', ${category.description ? `'${category.description.replace(/'/g, "''")}'` : 'NULL'}, ${category.imageUrl ? `'${category.imageUrl.replace(/'/g, "''")}'` : 'NULL'}, ${category.iconName ? `'${category.iconName.replace(/'/g, "''")}'` : 'NULL'}, ${category.color ? `'${category.color.replace(/'/g, "''")}'` : 'NULL'}, ${category.hoverColor ? `'${category.hoverColor.replace(/'/g, "''")}'` : 'NULL'}, '${category.slug.replace(/'/g, "''")}', ${category.parentId || 'NULL'}, ${category.isActive}, ${category.sortOrder}, ${category.seoTitle ? `'${category.seoTitle.replace(/'/g, "''")}'` : 'NULL'}, ${category.seoDescription ? `'${category.seoDescription.replace(/'/g, "''")}'` : 'NULL'}, '${category.createdAt.toISOString()}', '${category.updatedAt.toISOString()}');\n`;
    }

    // Добавляем данные товаров
    for (const product of products) {
      sqlDump += `INSERT INTO "Product" ("id", "name", "title", "description", "shortDescription", "mainImageUrl", "categoryId", "slug", "sku", "price", "oldPrice", "currency", "inStock", "stockQuantity", "isNew", "isPopular", "isFeatured", "rating", "reviewsCount", "seoTitle", "seoDescription", "createdAt", "updatedAt") VALUES (${product.id}, '${product.name.replace(/'/g, "''")}', ${product.title ? `'${product.title.replace(/'/g, "''")}'` : 'NULL'}, ${product.description ? `'${product.description.replace(/'/g, "''")}'` : 'NULL'}, ${product.shortDescription ? `'${product.shortDescription.replace(/'/g, "''")}'` : 'NULL'}, ${product.mainImageUrl ? `'${product.mainImageUrl.replace(/'/g, "''")}'` : 'NULL'}, ${product.categoryId}, '${product.slug.replace(/'/g, "''")}', ${product.sku ? `'${product.sku.replace(/'/g, "''")}'` : 'NULL'}, ${product.price}, ${product.oldPrice || 'NULL'}, '${product.currency}', ${product.inStock}, ${product.stockQuantity}, ${product.isNew}, ${product.isPopular}, ${product.isFeatured}, ${product.rating}, ${product.reviewsCount}, ${product.seoTitle ? `'${product.seoTitle.replace(/'/g, "''")}'` : 'NULL'}, ${product.seoDescription ? `'${product.seoDescription.replace(/'/g, "''")}'` : 'NULL'}, '${product.createdAt.toISOString()}', '${product.updatedAt.toISOString()}');\n`;
    }

    // Добавляем изображения товаров
    for (const image of productImages) {
      sqlDump += `INSERT INTO "ProductImage" ("id", "productId", "imageUrl", "altText", "sortOrder", "isMain", "createdAt") VALUES (${image.id}, ${image.productId}, '${image.imageUrl.replace(/'/g, "''")}', ${image.altText ? `'${image.altText.replace(/'/g, "''")}'` : 'NULL'}, ${image.sortOrder}, ${image.isMain}, '${image.createdAt.toISOString()}');\n`;
    }

    // Добавляем спецификации товаров
    for (const spec of productSpecs) {
      sqlDump += `INSERT INTO "ProductSpecification" ("id", "productId", "name", "value", "unit", "sortOrder", "createdAt") VALUES (${spec.id}, ${spec.productId}, '${spec.name.replace(/'/g, "''")}', '${spec.value.replace(/'/g, "''")}', ${spec.unit ? `'${spec.unit.replace(/'/g, "''")}'` : 'NULL'}, ${spec.sortOrder}, '${spec.createdAt.toISOString()}');\n`;
    }

    // Добавляем цвета товаров
    for (const color of productColors) {
      sqlDump += `INSERT INTO "ProductColor" ("id", "productId", "name", "value", "hexColor", "imageUrl", "sortOrder", "createdAt") VALUES (${color.id}, ${color.productId}, '${color.name.replace(/'/g, "''")}', '${color.value.replace(/'/g, "''")}', '${color.hexColor.replace(/'/g, "''")}', ${color.imageUrl ? `'${color.imageUrl.replace(/'/g, "''")}'` : 'NULL'}, ${color.sortOrder}, '${color.createdAt.toISOString()}');\n`;
    }

    // Добавляем пользователей
    for (const user of users) {
      sqlDump += `INSERT INTO "User" ("id", "email", "passwordHash", "firstName", "lastName", "phone", "role", "isActive", "avatarUrl", "preferences", "createdAt", "updatedAt") VALUES (${user.id}, '${user.email.replace(/'/g, "''")}', '${user.passwordHash.replace(/'/g, "''")}', '${user.firstName.replace(/'/g, "''")}', '${user.lastName.replace(/'/g, "''")}', ${user.phone ? `'${user.phone.replace(/'/g, "''")}'` : 'NULL'}, '${user.role}', ${user.isActive}, ${user.avatarUrl ? `'${user.avatarUrl.replace(/'/g, "''")}'` : 'NULL'}, ${user.preferences ? `'${JSON.stringify(user.preferences).replace(/'/g, "''")}'` : 'NULL'}, '${user.createdAt.toISOString()}', '${user.updatedAt.toISOString()}');\n`;
    }

    // Добавляем заказы
    for (const order of orders) {
      sqlDump += `INSERT INTO "Order" ("id", "orderNumber", "userId", "customerInfo", "status", "paymentStatus", "shippingAddress", "billingAddress", "subtotal", "shippingCost", "tax", "discount", "total", "currency", "notes", "createdAt", "updatedAt") VALUES (${order.id}, '${order.orderNumber.replace(/'/g, "''")}', ${order.userId || 'NULL'}, '${JSON.stringify(order.customerInfo).replace(/'/g, "''")}', '${order.status}', '${order.paymentStatus}', '${JSON.stringify(order.shippingAddress).replace(/'/g, "''")}', ${order.billingAddress ? `'${JSON.stringify(order.billingAddress).replace(/'/g, "''")}'` : 'NULL'}, ${order.subtotal}, ${order.shippingCost}, ${order.tax}, ${order.discount}, ${order.total}, '${order.currency}', ${order.notes ? `'${order.notes.replace(/'/g, "''")}'` : 'NULL'}, '${order.createdAt.toISOString()}', '${order.updatedAt.toISOString()}');\n`;
    }

    // Добавляем позиции заказов
    for (const item of orderItems) {
      sqlDump += `INSERT INTO "OrderItem" ("id", "orderId", "productId", "quantity", "price", "totalPrice", "selectedColor", "selectedOptions", "createdAt") VALUES (${item.id}, ${item.orderId}, ${item.productId || 'NULL'}, ${item.quantity}, ${item.price}, ${item.totalPrice}, ${item.selectedColor ? `'${item.selectedColor.replace(/'/g, "''")}'` : 'NULL'}, ${item.selectedOptions ? `'${JSON.stringify(item.selectedOptions).replace(/'/g, "''")}'` : 'NULL'}, '${item.createdAt.toISOString()}');\n`;
    }

    // Добавляем контактные формы
    for (const form of contactForms) {
      sqlDump += `INSERT INTO "ContactForm" ("id", "name", "email", "phone", "company", "subject", "message", "status", "adminNotes", "createdAt", "updatedAt") VALUES (${form.id}, '${form.name.replace(/'/g, "''")}', '${form.email.replace(/'/g, "''")}', ${form.phone ? `'${form.phone.replace(/'/g, "''")}'` : 'NULL'}, ${form.company ? `'${form.company.replace(/'/g, "''")}'` : 'NULL'}, '${form.subject.replace(/'/g, "''")}', '${form.message.replace(/'/g, "''")}', '${form.status}', ${form.adminNotes ? `'${form.adminNotes.replace(/'/g, "''")}'` : 'NULL'}, '${form.createdAt.toISOString()}', '${form.updatedAt.toISOString()}');\n`;
    }

    // Добавляем обратные звонки
    for (const callback of callbackRequests) {
      sqlDump += `INSERT INTO "CallbackRequest" ("id", "name", "phone", "preferredTime", "message", "status", "adminNotes", "createdAt", "updatedAt") VALUES (${callback.id}, '${callback.name.replace(/'/g, "''")}', '${callback.phone.replace(/'/g, "''")}', ${callback.preferredTime ? `'${callback.preferredTime.replace(/'/g, "''")}'` : 'NULL'}, ${callback.message ? `'${callback.message.replace(/'/g, "''")}'` : 'NULL'}, '${callback.status}', ${callback.adminNotes ? `'${callback.adminNotes.replace(/'/g, "''")}'` : 'NULL'}, '${callback.createdAt.toISOString()}', '${callback.updatedAt.toISOString()}');\n`;
    }

    // Добавляем настройки сайта
    for (const setting of siteSettings) {
      sqlDump += `INSERT INTO "SiteSetting" ("id", "key", "value", "type", "description", "updatedAt") VALUES (${setting.id}, '${setting.key.replace(/'/g, "''")}', ${setting.value ? `'${setting.value.replace(/'/g, "''")}'` : 'NULL'}, '${setting.type}', ${setting.description ? `'${setting.description.replace(/'/g, "''")}'` : 'NULL'}, '${setting.updatedAt.toISOString()}');\n`;
    }

    // Добавляем логи админа
    for (const log of adminLogs) {
      sqlDump += `INSERT INTO "AdminLog" ("id", "userId", "action", "tableName", "recordId", "oldValues", "newValues", "ipAddress", "userAgent", "createdAt") VALUES (${log.id}, ${log.userId || 'NULL'}, '${log.action.replace(/'/g, "''")}', ${log.tableName ? `'${log.tableName.replace(/'/g, "''")}'` : 'NULL'}, ${log.recordId || 'NULL'}, ${log.oldValues ? `'${JSON.stringify(log.oldValues).replace(/'/g, "''")}'` : 'NULL'}, ${log.newValues ? `'${JSON.stringify(log.newValues).replace(/'/g, "''")}'` : 'NULL'}, ${log.ipAddress ? `'${log.ipAddress.replace(/'/g, "''")}'` : 'NULL'}, ${log.userAgent ? `'${log.userAgent.replace(/'/g, "''")}'` : 'NULL'}, '${log.createdAt.toISOString()}');\n`;
    }

    // Сохраняем SQL дамп
    const dumpPath = path.join(process.cwd(), 'database-dump.sql');
    await fs.writeFile(dumpPath, sqlDump);

    console.log('✅ SQL дамп создан!');
    console.log(`📁 Файл: ${dumpPath}`);
    console.log(`📊 Статистика:`);
    console.log(`   📁 Категории: ${categories.length}`);
    console.log(`   📦 Товары: ${products.length}`);
    console.log(`   🖼️ Изображения: ${productImages.length}`);
    console.log(`   📋 Спецификации: ${productSpecs.length}`);
    console.log(`   🎨 Цвета: ${productColors.length}`);
    console.log(`   👥 Пользователи: ${users.length}`);
    console.log(`   📋 Заказы: ${orders.length}`);
    console.log(`   🛒 Позиции заказов: ${orderItems.length}`);
    console.log(`   📞 Контакты: ${contactForms.length}`);
    console.log(`   🔄 Обратные звонки: ${callbackRequests.length}`);
    console.log(`   ⚙️ Настройки: ${siteSettings.length}`);
    console.log(`   📝 Логи: ${adminLogs.length}`);

  } catch (error) {
    console.error('❌ Ошибка при создании SQL дампа:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSqlDump();
