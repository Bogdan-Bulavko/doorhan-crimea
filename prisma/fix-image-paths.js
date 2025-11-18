/* eslint-disable no-console */
/**
 * Скрипт для исправления путей изображений товаров
 * Сопоставляет файлы из public/images/products/ с товарами и обновляет пути в БД
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const productsImagesDir = path.join(process.cwd(), 'public', 'images', 'products');

// Функция для нормализации строки (удаление спецсимволов, приведение к нижнему регистру)
function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Функция для извлечения ключевых слов из названия товара
function extractKeywords(productName) {
  const normalized = normalizeString(productName);
  // Убираем общие слова
  const stopWords = ['для', 'из', 'серии', 'серий', 'серия', 'сери', 'сере', 'с', 'и', 'или', 'в', 'на', 'по', 'от', 'до'];
  return normalized
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 5); // Берем первые 5 ключевых слов
}

// Функция для поиска соответствия файла товару
function findProductMatch(fileName, products) {
  const normalizedFileName = normalizeString(fileName);
  
  // Пробуем найти точное совпадение по ключевым словам
  for (const product of products) {
    const productKeywords = extractKeywords(product.name);
    const matchCount = productKeywords.filter(keyword => 
      normalizedFileName.includes(keyword)
    ).length;
    
    // Если найдено 3+ совпадения ключевых слов, считаем это совпадением
    if (matchCount >= 3) {
      return product;
    }
  }
  
  return null;
}

async function fixImagePaths() {
  console.log('🔧 Исправление путей изображений...\n');
  
  // Проверяем наличие папки
  if (!fs.existsSync(productsImagesDir)) {
    console.error('❌ Папка public/images/products/ не найдена');
    return;
  }
  
  // Получаем все файлы из папки
  const files = fs.readdirSync(productsImagesDir)
    .filter(file => {
      const filePath = path.join(productsImagesDir, file);
      return fs.statSync(filePath).isFile() && 
             (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png'));
    });
  
  console.log(`📁 Найдено файлов изображений: ${files.length}\n`);
  
  // Получаем все товары
  const products = await prisma.product.findMany({
    include: {
      images: true,
    },
  });
  
  console.log(`📦 Найдено товаров: ${products.length}\n`);
  
  // Группируем файлы по товарам
  const fileToProductMap = new Map();
  const unmatchedFiles = [];
  
  for (const file of files) {
    const product = findProductMatch(file, products);
    if (product) {
      if (!fileToProductMap.has(product.id)) {
        fileToProductMap.set(product.id, []);
      }
      fileToProductMap.get(product.id).push(file);
    } else {
      unmatchedFiles.push(file);
    }
  }
  
  console.log(`✅ Найдено соответствий: ${fileToProductMap.size}`);
  console.log(`⚠️  Не сопоставлено файлов: ${unmatchedFiles.length}\n`);
  
  // Обновляем пути в БД
  let updated = 0;
  let created = 0;
  
  for (const [productId, matchedFiles] of fileToProductMap.entries()) {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      
      // Удаляем старые изображения с undefined
      await prisma.productImage.deleteMany({
        where: {
          productId: productId,
          imageUrl: '/images/products/undefined',
        },
      });
      
      // Добавляем новые изображения
      for (let i = 0; i < matchedFiles.length; i++) {
        const file = matchedFiles[i];
        const imageUrl = `/images/products/${file}`;
        
        // Проверяем, не существует ли уже такое изображение
        const existing = await prisma.productImage.findFirst({
          where: {
            productId: productId,
            imageUrl: imageUrl,
          },
        });
        
        if (!existing) {
          await prisma.productImage.create({
            data: {
              productId: productId,
              imageUrl: imageUrl,
              altText: product.name,
              sortOrder: i,
              isMain: i === 0, // Первое изображение - основное
            },
          });
          created++;
        }
      }
      
      // Обновляем mainImageUrl товара, если его нет
      if (!product.mainImageUrl && matchedFiles.length > 0) {
        await prisma.product.update({
          where: { id: productId },
          data: {
            mainImageUrl: `/images/products/${matchedFiles[0]}`,
          },
        });
      }
      
      updated++;
      if (updated % 10 === 0) {
        console.log(`  ✓ Обработано товаров: ${updated}/${fileToProductMap.size}`);
      }
    } catch (error) {
      console.error(`  ✗ Ошибка при обработке товара ID ${productId}:`, error.message);
    }
  }
  
  console.log(`\n✅ Обновлено товаров: ${updated}`);
  console.log(`✅ Создано изображений: ${created}`);
  
  if (unmatchedFiles.length > 0) {
    console.log(`\n⚠️  Не сопоставленные файлы (первые 10):`);
    unmatchedFiles.slice(0, 10).forEach(file => console.log(`  - ${file}`));
  }
  
  // Финальная статистика
  const stats = {
    totalImages: await prisma.productImage.count(),
    imagesWithValidPaths: await prisma.productImage.findMany({
      where: {
        imageUrl: { not: { contains: 'undefined' } },
      },
    }).then(imgs => imgs.length),
    productsWithImages: await prisma.product.findMany({
      where: {
        images: { some: {} },
      },
    }).then(products => products.length),
  };
  
  console.log('\n📊 Финальная статистика:');
  console.log(`  🖼️  Всего изображений: ${stats.totalImages}`);
  console.log(`  ✅ Изображений с валидными путями: ${stats.imagesWithValidPaths}`);
  console.log(`  📦 Товаров с изображениями: ${stats.productsWithImages}\n`);
}

async function main() {
  try {
    await fixImagePaths();
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

