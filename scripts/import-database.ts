import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function importDatabase() {
  try {
    console.log('🔄 Импорт базы данных...');

    // Читаем файл экспорта
    const exportPath = path.join(process.cwd(), 'database-export.json');
    const exportData = JSON.parse(await fs.readFile(exportPath, 'utf-8'));

    console.log(`📅 Дата экспорта: ${exportData.exportDate}`);
    console.log(`🔢 Версия: ${exportData.version}`);

    // Очищаем существующие данные (осторожно!)
    console.log('🧹 Очистка существующих данных...');
    await prisma.adminLog.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productColor.deleteMany();
    await prisma.productSpecification.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.contactForm.deleteMany();
    await prisma.callbackRequest.deleteMany();
    await prisma.siteSetting.deleteMany();
    await prisma.user.deleteMany();

    // Импортируем данные в правильном порядке
    console.log('📥 Импорт пользователей...');
    for (const user of exportData.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          avatarUrl: user.avatarUrl,
          preferences: user.preferences,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }

    console.log('📥 Импорт настроек сайта...');
    for (const setting of exportData.siteSettings) {
      await prisma.siteSetting.create({
        data: {
          id: setting.id,
          key: setting.key,
          value: setting.value,
          type: setting.type,
          description: setting.description,
          updatedAt: new Date(setting.updatedAt)
        }
      });
    }

    console.log('📥 Импорт категорий...');
    for (const category of exportData.categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl,
          iconName: category.iconName,
          color: category.color,
          hoverColor: category.hoverColor,
          slug: category.slug,
          parentId: category.parentId,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt)
        }
      });
    }

    console.log('📥 Импорт товаров...');
    for (const product of exportData.products) {
      await prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          title: product.title,
          description: product.description,
          shortDescription: product.shortDescription,
          mainImageUrl: product.mainImageUrl,
          categoryId: product.categoryId,
          slug: product.slug,
          sku: product.sku,
          price: product.price,
          oldPrice: product.oldPrice,
          currency: product.currency,
          inStock: product.inStock,
          stockQuantity: product.stockQuantity,
          isNew: product.isNew,
          isPopular: product.isPopular,
          isFeatured: product.isFeatured,
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt)
        }
      });

      // Импорт изображений товара
      for (const image of product.images) {
        await prisma.productImage.create({
          data: {
            id: image.id,
            productId: product.id,
            imageUrl: image.imageUrl,
            altText: image.altText,
            sortOrder: image.sortOrder,
            isMain: image.isMain,
            createdAt: new Date(image.createdAt)
          }
        });
      }

      // Импорт спецификаций товара
      for (const spec of product.specifications) {
        await prisma.productSpecification.create({
          data: {
            id: spec.id,
            productId: product.id,
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            sortOrder: spec.sortOrder,
            createdAt: new Date(spec.createdAt)
          }
        });
      }

      // Импорт цветов товара
      for (const color of product.colors) {
        await prisma.productColor.create({
          data: {
            id: color.id,
            productId: product.id,
            name: color.name,
            value: color.value,
            hexColor: color.hexColor,
            imageUrl: color.imageUrl,
            sortOrder: color.sortOrder,
            createdAt: new Date(color.createdAt)
          }
        });
      }
    }

    console.log('📥 Импорт заказов...');
    for (const order of exportData.orders) {
      await prisma.order.create({
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          customerInfo: order.customerInfo,
          status: order.status,
          paymentStatus: order.paymentStatus,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          tax: order.tax,
          discount: order.discount,
          total: order.total,
          currency: order.currency,
          notes: order.notes,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        }
      });

      // Импорт позиций заказа
      for (const item of order.items) {
        await prisma.orderItem.create({
          data: {
            id: item.id,
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            selectedColor: item.selectedColor,
            selectedOptions: item.selectedOptions,
            createdAt: new Date(item.createdAt)
          }
        });
      }
    }

    console.log('📥 Импорт контактных форм...');
    for (const form of exportData.contactForms) {
      await prisma.contactForm.create({
        data: {
          id: form.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          subject: form.subject,
          message: form.message,
          status: form.status,
          adminNotes: form.adminNotes,
          createdAt: new Date(form.createdAt),
          updatedAt: new Date(form.updatedAt)
        }
      });
    }

    console.log('📥 Импорт обратных звонков...');
    for (const callback of exportData.callbackRequests) {
      await prisma.callbackRequest.create({
        data: {
          id: callback.id,
          name: callback.name,
          phone: callback.phone,
          preferredTime: callback.preferredTime,
          message: callback.message,
          status: callback.status,
          adminNotes: callback.adminNotes,
          createdAt: new Date(callback.createdAt),
          updatedAt: new Date(callback.updatedAt)
        }
      });
    }

    console.log('📥 Импорт логов админа...');
    for (const log of exportData.adminLogs) {
      await prisma.adminLog.create({
        data: {
          id: log.id,
          userId: log.userId,
          action: log.action,
          tableName: log.tableName,
          recordId: log.recordId,
          oldValues: log.oldValues,
          newValues: log.newValues,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: new Date(log.createdAt)
        }
      });
    }

    console.log('✅ База данных успешно импортирована!');
    console.log(`📊 Импортировано:`);
    console.log(`   👥 Пользователи: ${exportData.users.length}`);
    console.log(`   📁 Категории: ${exportData.categories.length}`);
    console.log(`   📦 Товары: ${exportData.products.length}`);
    console.log(`   📋 Заказы: ${exportData.orders.length}`);
    console.log(`   📞 Контакты: ${exportData.contactForms.length}`);
    console.log(`   🔄 Обратные звонки: ${exportData.callbackRequests.length}`);
    console.log(`   ⚙️ Настройки: ${exportData.siteSettings.length}`);
    console.log(`   📝 Логи: ${exportData.adminLogs.length}`);

  } catch (error) {
    console.error('❌ Ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importDatabase();
