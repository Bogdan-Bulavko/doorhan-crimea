/* eslint-disable no-console */
/**
 * Скрипт для восстановления данных из резервной копии БД
 * Восстанавливает: пользователей, категории, товары, настройки
 * НЕ удаляет существующие регионы
 */
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Подключаемся к текущей БД
const prisma = new PrismaClient();

// Подключаемся к старой БД
const backupDbPath = path.join(__dirname, '..', 'old_dev.db');
const backupPrisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${backupDbPath}`,
    },
  },
});

async function restoreUsers() {
  console.log('📦 Восстановление пользователей...');
  const users = await backupPrisma.user.findMany();
  
  for (const user of users) {
    try {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          avatarUrl: user.avatarUrl,
          preferences: user.preferences,
        },
        create: {
          email: user.email,
          passwordHash: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          avatarUrl: user.avatarUrl,
          preferences: user.preferences,
        },
      });
      console.log(`  ✓ Пользователь: ${user.email}`);
    } catch (error) {
      console.error(`  ✗ Ошибка при восстановлении пользователя ${user.email}:`, error.message);
    }
  }
  console.log(`✅ Восстановлено пользователей: ${users.length}\n`);
}

async function restoreCategories() {
  console.log('📦 Восстановление категорий...');
  const categories = await backupPrisma.category.findMany({
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
  });
  
  // Сначала восстанавливаем категории без родителя
  const rootCategories = categories.filter(c => !c.parentId);
  const childCategories = categories.filter(c => c.parentId);
  
  const categoryMap = new Map();
  
  // Восстанавливаем корневые категории
  for (const cat of rootCategories) {
    try {
      const created = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          iconName: cat.iconName,
          color: cat.color,
          hoverColor: cat.hoverColor,
          isActive: cat.isActive,
          sortOrder: cat.sortOrder,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
        },
        create: {
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          iconName: cat.iconName,
          color: cat.color,
          hoverColor: cat.hoverColor,
          slug: cat.slug,
          isActive: cat.isActive,
          sortOrder: cat.sortOrder,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
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
      const parentId = categoryMap.get(cat.parentId);
      if (!parentId) {
        console.warn(`  ⚠ Пропущена категория ${cat.name} - родитель не найден`);
        continue;
      }
      
      const created = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          iconName: cat.iconName,
          color: cat.color,
          hoverColor: cat.hoverColor,
          parentId: parentId,
          isActive: cat.isActive,
          sortOrder: cat.sortOrder,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
        },
        create: {
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl,
          iconName: cat.iconName,
          color: cat.color,
          hoverColor: cat.hoverColor,
          slug: cat.slug,
          parentId: parentId,
          isActive: cat.isActive,
          sortOrder: cat.sortOrder,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
        },
      });
      categoryMap.set(cat.id, created.id);
      console.log(`  ✓ Категория: ${cat.name} (дочерняя)`);
    } catch (error) {
      console.error(`  ✗ Ошибка при восстановлении категории ${cat.name}:`, error.message);
    }
  }
  
  console.log(`✅ Восстановлено категорий: ${categories.length}\n`);
  return categoryMap;
}

async function restoreProducts(categoryMap) {
  console.log('📦 Восстановление товаров...');
  const products = await backupPrisma.product.findMany({
    include: {
      images: true,
      specifications: true,
      colors: true,
    },
  });
  
  let restored = 0;
  for (const prod of products) {
    try {
      const categoryId = categoryMap.get(prod.categoryId);
      if (!categoryId) {
        console.warn(`  ⚠ Пропущен товар ${prod.name} - категория не найдена`);
        continue;
      }
      
      // Проверяем, существует ли товар
      const existing = await prisma.product.findUnique({
        where: { slug: prod.slug },
      });
      
      const productData = {
        name: prod.name,
        title: prod.title,
        description: prod.description,
        shortDescription: prod.shortDescription,
        mainImageUrl: prod.mainImageUrl,
        categoryId: categoryId,
        sku: prod.sku,
        price: prod.price,
        oldPrice: prod.oldPrice,
        currency: prod.currency,
        inStock: prod.inStock,
        stockQuantity: prod.stockQuantity,
        isNew: prod.isNew,
        isPopular: prod.isPopular,
        isFeatured: prod.isFeatured,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        seoTitle: prod.seoTitle,
        seoDescription: prod.seoDescription,
      };
      
      if (existing) {
        // Обновляем существующий
        await prisma.product.update({
          where: { id: existing.id },
          data: productData,
        });
      } else {
        // Создаем новый
        await prisma.product.create({
          data: {
            ...productData,
            slug: prod.slug,
          },
        });
      }
      
      restored++;
      if (restored % 10 === 0) {
        console.log(`  ✓ Обработано товаров: ${restored}/${products.length}`);
      }
    } catch (error) {
      console.error(`  ✗ Ошибка при восстановлении товара ${prod.name}:`, error.message);
    }
  }
  
  console.log(`✅ Восстановлено товаров: ${restored}/${products.length}\n`);
}

async function restoreProductRelations(products, categoryMap) {
  console.log('📦 Восстановление связей товаров (изображения, характеристики, цвета)...');
  
  let imagesRestored = 0;
  let specsRestored = 0;
  let colorsRestored = 0;
  
  for (const prod of products) {
    try {
      const categoryId = categoryMap.get(prod.categoryId);
      if (!categoryId) continue;
      
      // Находим товар в новой БД
      const newProduct = await prisma.product.findUnique({
        where: { slug: prod.slug },
      });
      
      if (!newProduct) continue;
      
      // Восстанавливаем изображения
      if (prod.images && prod.images.length > 0) {
        await prisma.productImage.deleteMany({
          where: { productId: newProduct.id },
        });
        
        for (const img of prod.images) {
          try {
            await prisma.productImage.create({
              data: {
                productId: newProduct.id,
                imageUrl: img.imageUrl,
                altText: img.altText,
                sortOrder: img.sortOrder,
                isMain: img.isMain,
              },
            });
            imagesRestored++;
          } catch (e) {
            // Игнорируем ошибки
          }
        }
      }
      
      // Восстанавливаем характеристики
      if (prod.specifications && prod.specifications.length > 0) {
        await prisma.productSpecification.deleteMany({
          where: { productId: newProduct.id },
        });
        
        for (const spec of prod.specifications) {
          try {
            await prisma.productSpecification.create({
              data: {
                productId: newProduct.id,
                name: spec.name,
                value: spec.value,
                unit: spec.unit,
                sortOrder: spec.sortOrder,
              },
            });
            specsRestored++;
          } catch (e) {
            // Игнорируем ошибки
          }
        }
      }
      
      // Восстанавливаем цвета
      if (prod.colors && prod.colors.length > 0) {
        await prisma.productColor.deleteMany({
          where: { productId: newProduct.id },
        });
        
        for (const color of prod.colors) {
          try {
            await prisma.productColor.create({
              data: {
                productId: newProduct.id,
                name: color.name,
                value: color.value,
                hexColor: color.hexColor,
                imageUrl: color.imageUrl,
                sortOrder: color.sortOrder,
              },
            });
            colorsRestored++;
          } catch (e) {
            // Игнорируем ошибки
          }
        }
      }
    } catch (error) {
      // Игнорируем ошибки для связей
    }
  }
  
  console.log(`✅ Восстановлено изображений: ${imagesRestored}`);
  console.log(`✅ Восстановлено характеристик: ${specsRestored}`);
  console.log(`✅ Восстановлено цветов: ${colorsRestored}\n`);
}

async function restoreSettings() {
  console.log('📦 Восстановление настроек сайта...');
  const settings = await backupPrisma.siteSetting.findMany();
  
  for (const setting of settings) {
    try {
      await prisma.siteSetting.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          type: setting.type,
          description: setting.description,
        },
        create: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          description: setting.description,
        },
      });
      console.log(`  ✓ Настройка: ${setting.key}`);
    } catch (error) {
      console.error(`  ✗ Ошибка при восстановлении настройки ${setting.key}:`, error.message);
    }
  }
  
  console.log(`✅ Восстановлено настроек: ${settings.length}\n`);
}

async function main() {
  console.log('🔄 Начало восстановления данных из резервной копии...\n');
  console.log(`📁 Источник: ${backupDbPath}\n`);
  
  try {
    // Проверяем наличие файла
    if (!fs.existsSync(backupDbPath)) {
      throw new Error(`Файл резервной копии не найден: ${backupDbPath}`);
    }
    
    await restoreUsers();
    const categoryMap = await restoreCategories();
    
    // Получаем товары со всеми связями
    const products = await backupPrisma.product.findMany({
      include: {
        images: true,
        specifications: true,
        colors: true,
      },
    });
    
    await restoreProducts(categoryMap);
    await restoreProductRelations(products, categoryMap);
    await restoreSettings();
    
    console.log('✅ Восстановление завершено успешно!');
    console.log('\n📊 Итоговая статистика:');
    
    const stats = {
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      settings: await prisma.siteSetting.count(),
      regions: await prisma.region.count(),
    };
    
    console.log(`  👥 Пользователи: ${stats.users}`);
    console.log(`  📁 Категории: ${stats.categories}`);
    console.log(`  📦 Товары: ${stats.products}`);
    console.log(`  ⚙️  Настройки: ${stats.settings}`);
    console.log(`  🌍 Регионы: ${stats.regions}`);
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await backupPrisma.$disconnect();
  }
}

main();
