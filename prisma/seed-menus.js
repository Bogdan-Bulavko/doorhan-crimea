/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedMenus() {
  console.log('🌱 Начинаем заполнение меню...');

  try {
    // Создаем меню Header
    const headerMenu = await prisma.menu.upsert({
      where: { name: 'header' },
      update: {
        description: 'Главное меню в шапке сайта',
      },
      create: {
        name: 'header',
        description: 'Главное меню в шапке сайта',
      },
    });

    console.log('✅ Меню Header создано/обновлено');

    // Удаляем старые пункты меню header (если есть)
    await prisma.menuItem.deleteMany({
      where: { menuId: headerMenu.id },
    });

    // Создаем пункты меню Header
    const headerItems = [
      { title: 'Главная', href: '/', sortOrder: 0 },
      { title: 'Категории', href: '/categories', sortOrder: 1 },
      { title: 'О компании', href: '/#about', sortOrder: 2 },
      { title: 'Контакты', href: '/#contacts', sortOrder: 3 },
    ];

    for (const item of headerItems) {
      await prisma.menuItem.create({
        data: {
          menuId: headerMenu.id,
          title: item.title,
          href: item.href,
          sortOrder: item.sortOrder,
          isActive: true,
        },
      });
    }

    console.log(`✅ Создано ${headerItems.length} пунктов меню Header`);

    // Создаем меню Footer
    const footerMenu = await prisma.menu.upsert({
      where: { name: 'footer' },
      update: {
        description: 'Меню в футере сайта',
      },
      create: {
        name: 'footer',
        description: 'Меню в футере сайта',
      },
    });

    console.log('✅ Меню Footer создано/обновлено');

    // Удаляем старые пункты меню footer (если есть)
    await prisma.menuItem.deleteMany({
      where: { menuId: footerMenu.id },
    });

    // Создаем секции футера с подпунктами
    const footerSections = [
      {
        title: 'Продукция',
        sortOrder: 0,
        children: [
          { title: 'Ворота', href: '#gates', sortOrder: 0 },
          { title: 'Роллеты', href: '#rollers', sortOrder: 1 },
          { title: 'Автоматика', href: '#automation', sortOrder: 2 },
          { title: 'Фурнитура', href: '#hardware', sortOrder: 3 },
        ],
      },
      {
        title: 'Услуги',
        sortOrder: 1,
        children: [
          { title: 'Установка', href: '#installation', sortOrder: 0 },
          { title: 'Сервис', href: '#service', sortOrder: 1 },
          { title: 'Гарантия', href: '#warranty', sortOrder: 2 },
          { title: 'Консультации', href: '#consultation', sortOrder: 3 },
        ],
      },
      {
        title: 'Компания',
        sortOrder: 2,
        children: [
          { title: 'О нас', href: '#about', sortOrder: 0 },
          { title: 'История', href: '#history', sortOrder: 1 },
          { title: 'Сертификаты', href: '#certificates', sortOrder: 2 },
          { title: 'Партнеры', href: '#partners', sortOrder: 3 },
        ],
      },
    ];

    for (const section of footerSections) {
      // Создаем родительский пункт (секцию)
      const parentItem = await prisma.menuItem.create({
        data: {
          menuId: footerMenu.id,
          title: section.title,
          href: '#',
          sortOrder: section.sortOrder,
          isActive: true,
        },
      });

      // Создаем дочерние пункты
      for (const child of section.children) {
        await prisma.menuItem.create({
          data: {
            menuId: footerMenu.id,
            title: child.title,
            href: child.href,
            parentId: parentItem.id,
            sortOrder: child.sortOrder,
            isActive: true,
          },
        });
      }

      console.log(`✅ Создана секция "${section.title}" с ${section.children.length} подпунктами`);
    }

    console.log('✅ Все меню успешно заполнены!');
  } catch (error) {
    console.error('❌ Ошибка при заполнении меню:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedMenus();
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

