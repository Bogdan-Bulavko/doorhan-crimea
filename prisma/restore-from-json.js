/* eslint-disable no-console */
/**
 * Скрипт для восстановления данных из database-export.json
 * Восстанавливает: категории и товары со всеми связями
 * НЕ удаляет существующие данные, использует upsert
 */
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function restoreCategories(data) {
  console.log('📦 Восстановление категорий...');
  
  if (!data.categories || !Array.isArray(data.categories)) {
    console.log('⚠️  Категории не найдены в JSON');
    return new Map();
  }

  const categoryMap = new Map();
  
  // Сначала восстанавливаем категории без родителя
  const rootCategories = data.categories.filter(c => !c.parentId);
  const childCategories = data.categories.filter(c => c.parentId);
  
  // Восстанавливаем корневые категории
  for (const cat of rootCategories) {
    try {
      const created = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description || null,
          imageUrl: cat.imageUrl || null,
          iconName: cat.iconName || null,
          color: cat.color || null,
          hoverColor: cat.hoverColor || null,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          sortOrder: cat.sortOrder || 0,
          seoTitle: cat.seoTitle || null,
          seoDescription: cat.seoDescription || null,
        },
        create: {
          name: cat.name,
          description: cat.description || null,
          imageUrl: cat.imageUrl || null,
          iconName: cat.iconName || null,
          color: cat.color || null,
          hoverColor: cat.hoverColor || null,
          slug: cat.slug,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          sortOrder: cat.sortOrder || 0,
          seoTitle: cat.seoTitle || null,
          seoDescription: cat.seoDescription || null,
        },
      });
      categoryMap.set(cat.id, created.id);
      console.log(`  ✓ Категория: ${cat.name}`);
    } catch (error) {
      console.error(`  ✗ Ошибка при восстановлении категории ${cat.name}:`, error.message);
    }
  }
  
  // Восстанавливаем дочерние категории
  for (const cat of childCategories) {
    try {
      const newParentId = categoryMap.get(cat.parentId);
      if (!newParentId) {
        console.warn(`  ⚠ Пропущена дочерняя категория ${cat.name} - родитель не найден`);
        continue;
      }
      
      const created = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description || null,
          imageUrl: cat.imageUrl || null,
          iconName: cat.iconName || null,
          color: cat.color || null,
          hoverColor: cat.hoverColor || null,
          parentId: newParentId,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          sortOrder: cat.sortOrder || 0,
          seoTitle: cat.seoTitle || null,
          seoDescription: cat.seoDescription || null,
        },
        create: {
          name: cat.name,
          description: cat.description || null,
          imageUrl: cat.imageUrl || null,
          iconName: cat.iconName || null,
          color: cat.color || null,
          hoverColor: cat.hoverColor || null,
          slug: cat.slug,
          parentId: newParentId,
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          sortOrder: cat.sortOrder || 0,
          seoTitle: cat.seoTitle || null,
          seoDescription: cat.seoDescription || null,
        },
      });
      categoryMap.set(cat.id, created.id);
      console.log(`  ✓ Категория: ${cat.name}`);
    } catch (error) {
      console.error(`  ✗ Ошибка при восстановлении категории ${cat.name}:`, error.message);
    }
  }
  
  console.log(`✅ Восстановлено категорий: ${categoryMap.size}\n`);
  return categoryMap;
}

async function restoreProducts(data, categoryMap) {
  console.log('📦 Восстановление товаров...');
  
  if (!data.categories || !Array.isArray(data.categories)) {
    console.log('⚠️  Товары не найдены в JSON');
    return;
  }

  let restored = 0;
  let skipped = 0;
  
  // Собираем все товары из всех категорий
  const allProducts = [];
  for (const category of data.categories) {
    if (category.products && Array.isArray(category.products)) {
      for (const product of category.products) {
        allProducts.push({
          ...product,
          oldCategoryId: product.categoryId,
        });
      }
    }
  }
  
  console.log(`  Найдено товаров для восстановления: ${allProducts.length}`);
  
  for (const prod of allProducts) {
    try {
      const categoryId = categoryMap.get(prod.oldCategoryId);
      if (!categoryId) {
        console.warn(`  ⚠ Пропущен товар ${prod.name} - категория не найдена (ID: ${prod.oldCategoryId})`);
        skipped++;
        continue;
      }
      
      // Проверяем, существует ли товар
      const existing = await prisma.product.findUnique({
        where: { slug: prod.slug },
      });
      
      const productData = {
        name: prod.name,
        title: prod.title || null,
        description: prod.description || null,
        shortDescription: prod.shortDescription || null,
        mainImageUrl: prod.mainImageUrl || null,
        categoryId: categoryId,
        slug: prod.slug,
        sku: prod.sku || null,
        price: prod.price || '0',
        oldPrice: prod.oldPrice || null,
        currency: prod.currency || 'RUB',
        inStock: prod.inStock !== undefined ? prod.inStock : true,
        stockQuantity: prod.stockQuantity || 0,
        isNew: prod.isNew || false,
        isPopular: prod.isPopular || false,
        isFeatured: prod.isFeatured || false,
        rating: prod.rating || '0',
        reviewsCount: prod.reviewsCount || 0,
        seoTitle: prod.seoTitle || null,
        seoDescription: prod.seoDescription || null,
      };
      
      let productId;
      if (existing) {
        // Обновляем существующий
        const updated = await prisma.product.update({
          where: { id: existing.id },
          data: productData,
        });
        productId = updated.id;
      } else {
        // Создаем новый
        const created = await prisma.product.create({
          data: productData,
        });
        productId = created.id;
      }
      
      // Восстанавливаем изображения
      if (prod.images && Array.isArray(prod.images)) {
        // Удаляем старые изображения товара
        await prisma.productImage.deleteMany({
          where: { productId: productId },
        });
        
        // Создаем новые изображения
        for (const img of prod.images) {
          await prisma.productImage.create({
            data: {
              productId: productId,
              imageUrl: img.imageUrl,
              altText: img.altText || null,
              sortOrder: img.sortOrder || 0,
              isMain: img.isMain || false,
            },
          });
        }
      }
      
      // Восстанавливаем спецификации
      if (prod.specifications && Array.isArray(prod.specifications)) {
        // Удаляем старые спецификации
        await prisma.productSpecification.deleteMany({
          where: { productId: productId },
        });
        
        // Создаем новые спецификации
        for (const spec of prod.specifications) {
          await prisma.productSpecification.create({
            data: {
              productId: productId,
              name: spec.name,
              value: spec.value,
              unit: spec.unit || null,
              sortOrder: spec.sortOrder || 0,
            },
          });
        }
      }
      
      // Восстанавливаем цвета
      if (prod.colors && Array.isArray(prod.colors)) {
        // Удаляем старые цвета
        await prisma.productColor.deleteMany({
          where: { productId: productId },
        });
        
        // Создаем новые цвета
        for (const color of prod.colors) {
          await prisma.productColor.create({
            data: {
              productId: productId,
              name: color.name,
              value: color.value,
              hexColor: color.hexColor,
              imageUrl: color.imageUrl || null,
              sortOrder: color.sortOrder || 0,
            },
          });
        }
      }
      
      restored++;
      if (restored % 10 === 0) {
        console.log(`  ✓ Обработано товаров: ${restored}/${allProducts.length}`);
      }
    } catch (error) {
      console.error(`  ✗ Ошибка при восстановлении товара ${prod.name}:`, error.message);
      skipped++;
    }
  }
  
  console.log(`✅ Восстановлено товаров: ${restored}`);
  if (skipped > 0) {
    console.log(`⚠️  Пропущено товаров: ${skipped}\n`);
  } else {
    console.log('');
  }
}

async function main() {
  const jsonPath = path.join(__dirname, '..', 'database-export.json');
  
  console.log('🔄 Начало восстановления данных из JSON...\n');
  console.log(`📁 Источник: ${jsonPath}\n`);
  
  try {
    // Проверяем наличие файла
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Файл не найден: ${jsonPath}`);
    }
    
    // Читаем JSON
    console.log('📖 Чтение JSON файла...');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(jsonContent);
    console.log('✅ JSON файл прочитан\n');
    
    // Восстанавливаем данные
    const categoryMap = await restoreCategories(data);
    await restoreProducts(data, categoryMap);
    
    console.log('✅ Восстановление завершено успешно!');
    console.log('\n📊 Итоговая статистика:');
    
    const stats = {
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      productImages: await prisma.productImage.count(),
      productSpecifications: await prisma.productSpecification.count(),
      productColors: await prisma.productColor.count(),
    };
    
    console.log(`  📁 Категории: ${stats.categories}`);
    console.log(`  📦 Товары: ${stats.products}`);
    console.log(`  🖼️  Изображения товаров: ${stats.productImages}`);
    console.log(`  📋 Спецификации: ${stats.productSpecifications}`);
    console.log(`  🎨 Цвета: ${stats.productColors}`);
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

