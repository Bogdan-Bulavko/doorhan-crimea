import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function exportDatabase() {
  try {
    console.log('🔄 Экспорт базы данных...');

    // Экспорт всех таблиц
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            images: true,
            specifications: true,
            colors: true
          }
        }
      }
    });

    const products = await prisma.product.findMany({
      include: {
        images: true,
        specifications: true,
        colors: true,
        category: true
      }
    });

    const users = await prisma.user.findMany();
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: true
      }
    });
    const contactForms = await prisma.contactForm.findMany();
    const callbackRequests = await prisma.callbackRequest.findMany();
    const siteSettings = await prisma.siteSetting.findMany();
    const adminLogs = await prisma.adminLog.findMany();

    // Создаем объект с данными
    const exportData = {
      categories,
      products,
      users,
      orders,
      contactForms,
      callbackRequests,
      siteSettings,
      adminLogs,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    // Сохраняем в JSON файл
    const exportPath = path.join(process.cwd(), 'database-export.json');
    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));

    console.log('✅ База данных экспортирована!');
    console.log(`📁 Файл: ${exportPath}`);
    console.log(`📊 Категории: ${categories.length}`);
    console.log(`📦 Товары: ${products.length}`);
    console.log(`👥 Пользователи: ${users.length}`);
    console.log(`📋 Заказы: ${orders.length}`);
    console.log(`📞 Контакты: ${contactForms.length}`);
    console.log(`🔄 Обратные звонки: ${callbackRequests.length}`);
    console.log(`⚙️ Настройки: ${siteSettings.length}`);
    console.log(`📝 Логи: ${adminLogs.length}`);

  } catch (error) {
    console.error('❌ Ошибка при экспорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabase();
