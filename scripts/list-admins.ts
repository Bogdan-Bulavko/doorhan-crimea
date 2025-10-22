import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    console.log('👥 Список всех админов:');
    console.log('='.repeat(50));

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      orderBy: { createdAt: 'asc' }
    });

    if (admins.length === 0) {
      console.log('❌ Админы не найдены!');
      return;
    }

    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. Админ #${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Имя: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Телефон: ${admin.phone || 'Не указан'}`);
      console.log(`   Роль: ${admin.role}`);
      console.log(`   Активен: ${admin.isActive ? '✅' : '❌'}`);
      console.log(`   Создан: ${admin.createdAt.toLocaleString('ru-RU')}`);
      console.log(`   Обновлен: ${admin.updatedAt.toLocaleString('ru-RU')}`);
    });

    console.log(`\n📊 Всего админов: ${admins.length}`);

  } catch (error) {
    console.error('❌ Ошибка при получении списка админов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
