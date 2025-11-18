/* eslint-disable no-console */
/**
 * Скрипт для исправления связей товаров с категориями и изображениями
 * Проверяет и восстанавливает все связи
 */
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();
const backupDbPath = path.join(__dirname, '..', 'old_dev.db');
const backupPrisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${backupDbPath}`,
    },
  },
});

async function fixProductRelations() {
  console.log('🔧 Исправление связей товаров...\n');
  
  // Получаем все товары из старой БД со всеми связями
  const backupProducts = await backupPrisma.product.findMany({
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      specifications: true,
      colors: true,
      category: true,
    },
  });
  
  console.log(`📦 Найдено товаров в резервной копии: ${backupProducts.length}\n`);
  
  // Получаем маппинг категорий
  const categoryMap = new Map();
  const backupCategories = await backupPrisma.category.findMany();
  const currentCategories = await prisma.category.findMany();
  
  for (const backupCat of backupCategories) {
    const currentCat = currentCategories.find(c => c.slug === backupCat.slug);
    if (currentCat) {
      categoryMap.set(backupCat.id, currentCat.id);
    }
  }
  
  console.log(`📁 Найдено соответствий категорий: ${categoryMap.size}\n`);
  
  let fixed = 0;
  let imagesFixed = 0;
  let specsFixed = 0;
  let colorsFixed = 0;
  
  for (const backupProd of backupProducts) {
    try {
      // Находим товар в текущей БД
      const currentProduct = await prisma.product.findUnique({
        where: { slug: backupProd.slug },
        include: {
          images: true,
          specifications: true,
          colors: true,
        },
      });
      
      if (!currentProduct) {
        console.warn(`⚠️  Товар не найден: ${backupProd.name}`);
        continue;
      }
      
      // Проверяем и исправляем категорию
      const correctCategoryId = categoryMap.get(backupProd.categoryId);
      if (correctCategoryId && currentProduct.categoryId !== correctCategoryId) {
        await prisma.product.update({
          where: { id: currentProduct.id },
          data: { categoryId: correctCategoryId },
        });
        console.log(`  ✓ Исправлена категория для: ${currentProduct.name}`);
        fixed++;
      }
      
      // Проверяем и исправляем изображения
      if (backupProd.images && backupProd.images.length > 0) {
        const currentImageUrls = new Set(currentProduct.images.map(img => img.imageUrl));
        const backupImageUrls = backupProd.images.map(img => img.imageUrl);
        
        // Удаляем старые изображения
        await prisma.productImage.deleteMany({
          where: { productId: currentProduct.id },
        });
        
        // Добавляем все изображения из резервной копии
        for (const backupImg of backupProd.images) {
          try {
            await prisma.productImage.create({
              data: {
                productId: currentProduct.id,
                imageUrl: backupImg.imageUrl,
                altText: backupImg.altText,
                sortOrder: backupImg.sortOrder,
                isMain: backupImg.isMain,
              },
            });
            imagesFixed++;
          } catch (e) {
            console.error(`    ✗ Ошибка при добавлении изображения: ${e.message}`);
          }
        }
      }
      
      // Проверяем и исправляем характеристики
      if (backupProd.specifications && backupProd.specifications.length > 0) {
        await prisma.productSpecification.deleteMany({
          where: { productId: currentProduct.id },
        });
        
        for (const backupSpec of backupProd.specifications) {
          try {
            await prisma.productSpecification.create({
              data: {
                productId: currentProduct.id,
                name: backupSpec.name,
                value: backupSpec.value,
                unit: backupSpec.unit,
                sortOrder: backupSpec.sortOrder,
              },
            });
            specsFixed++;
          } catch (e) {
            // Игнорируем ошибки
          }
        }
      }
      
      // Проверяем и исправляем цвета
      if (backupProd.colors && backupProd.colors.length > 0) {
        await prisma.productColor.deleteMany({
          where: { productId: currentProduct.id },
        });
        
        for (const backupColor of backupProd.colors) {
          try {
            await prisma.productColor.create({
              data: {
                productId: currentProduct.id,
                name: backupColor.name,
                value: backupColor.value,
                hexColor: backupColor.hexColor,
                imageUrl: backupColor.imageUrl,
                sortOrder: backupColor.sortOrder,
              },
            });
            colorsFixed++;
          } catch (e) {
            // Игнорируем ошибки
          }
        }
      }
      
      // Убеждаемся, что товар в наличии
      if (!currentProduct.inStock) {
        await prisma.product.update({
          where: { id: currentProduct.id },
          data: { inStock: true },
        });
        console.log(`  ✓ Включен inStock для: ${currentProduct.name}`);
      }
      
    } catch (error) {
      console.error(`  ✗ Ошибка при обработке товара ${backupProd.name}:`, error.message);
    }
  }
  
  console.log(`\n✅ Исправлено связей категорий: ${fixed}`);
  console.log(`✅ Восстановлено изображений: ${imagesFixed}`);
  console.log(`✅ Восстановлено характеристик: ${specsFixed}`);
  console.log(`✅ Восстановлено цветов: ${colorsFixed}\n`);
  
  // Финальная проверка
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      categoryId: true,
      inStock: true,
      images: { select: { id: true } },
    },
  });
  
  const stats = {
    products: allProducts.length,
    productsWithImages: allProducts.filter(p => p.images.length > 0).length,
    productsWithCategory: allProducts.filter(p => p.categoryId !== null).length,
    productsInStock: allProducts.filter(p => p.inStock).length,
    totalImages: await prisma.productImage.count(),
  };
  
  console.log('📊 Финальная статистика:');
  console.log(`  📦 Всего товаров: ${stats.products}`);
  console.log(`  📦 Товаров с изображениями: ${stats.productsWithImages}`);
  console.log(`  📦 Товаров с категориями: ${stats.productsWithCategory}`);
  console.log(`  📦 Товаров в наличии: ${stats.productsInStock}`);
  console.log(`  🖼️  Всего изображений: ${stats.totalImages}\n`);
}

async function main() {
  try {
    await fixProductRelations();
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await backupPrisma.$disconnect();
  }
}

main();

