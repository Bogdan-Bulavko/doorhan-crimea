import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3] || 'admin123';

    if (!email) {
      console.log('❌ Укажите email админа!');
      console.log('Использование: npm run reset-admin-password "admin@example.com" "newpassword"');
      return;
    }

    console.log('🔧 Сброс пароля админа...');
    console.log(`Email: ${email}`);
    console.log(`Новый пароль: ${newPassword}`);

    // Ищем админа по email
    const admin = await prisma.user.findUnique({
      where: { email }
    });

    if (!admin) {
      console.log('❌ Админ с таким email не найден!');
      return;
    }

    if (admin.role !== 'admin') {
      console.log('❌ Пользователь не является админом!');
      console.log(`Роль: ${admin.role}`);
      return;
    }

    // Хэшируем новый пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Обновляем пароль
    const updatedAdmin = await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    console.log('✅ Пароль успешно обновлен!');
    console.log(`ID: ${updatedAdmin.id}`);
    console.log(`Email: ${updatedAdmin.email}`);
    console.log(`Имя: ${updatedAdmin.firstName} ${updatedAdmin.lastName}`);
    console.log(`Роль: ${updatedAdmin.role}`);
    console.log(`Обновлен: ${updatedAdmin.updatedAt}`);

  } catch (error) {
    console.error('❌ Ошибка при сбросе пароля:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
