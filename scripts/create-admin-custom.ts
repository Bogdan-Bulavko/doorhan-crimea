import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Получаем данные от пользователя
    const email = process.argv[2] || 'admin2@doorhan-crimea.ru';
    const password = process.argv[3] || 'admin123';
    const firstName = process.argv[4] || 'Администратор';
    const lastName = process.argv[5] || 'Системы';

    console.log('🔧 Создание нового админа...');
    console.log(`Email: ${email}`);
    console.log(`Пароль: ${password}`);
    console.log(`Имя: ${firstName} ${lastName}`);

    // Проверяем, существует ли уже админ с таким email
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('❌ Админ с таким email уже существует!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`ID: ${existingAdmin.id}`);
      console.log(`Роль: ${existingAdmin.role}`);
      return;
    }

    // Хэшируем пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем админа
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Админ успешно создан!');
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Имя: ${admin.firstName} ${admin.lastName}`);
    console.log(`Роль: ${admin.role}`);
    console.log(`Активен: ${admin.isActive}`);
    console.log(`Создан: ${admin.createdAt}`);

  } catch (error) {
    console.error('❌ Ошибка при создании админа:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
