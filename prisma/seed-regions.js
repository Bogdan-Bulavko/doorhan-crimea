/* eslint-disable no-console */
/**
 * Скрипт для добавления/обновления регионов БЕЗ очистки базы данных
 * Используйте: node prisma/seed-regions.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedRegions() {
  const regionsData = [
    {
      code: 'default',
      name: 'Симферополь',
      phone: '+79782944149',
      phoneFormatted: '+7 (978) 294 41 49',
      email: 'info@doorhan-crimea.ru',
      address: 'Симферополь, ул. Примерная, 1',
      addressDescription: 'Офис и выставочный зал',
      workingHours: 'Пн-Пт: 9:00-18:00, Сб: 9:00-15:00',
      workingHoursDescription: 'Воскресенье - выходной',
      officeName: 'Главный офис',
      isActive: true,
      sortOrder: 0,
    },
    {
      code: 'simferopol',
      name: 'Симферополь',
      phone: '+79782944149',
      phoneFormatted: '+7 (978) 294 41 49',
      email: 'simferopol@doorhan-crimea.ru',
      address: 'Симферополь, ул. Киевская, 15',
      addressDescription: 'Офис и выставочный зал в Симферополе',
      workingHours: 'Пн-Пт: 9:00-18:00, Сб: 9:00-15:00',
      workingHoursDescription: 'Воскресенье - выходной',
      officeName: 'Офис в Симферополе',
      isActive: true,
      sortOrder: 1,
    },
    {
      code: 'yalta',
      name: 'Ялта',
      phone: '+79782944150',
      phoneFormatted: '+7 (978) 294 41 50',
      email: 'yalta@doorhan-crimea.ru',
      address: 'Ялта, ул. Набережная, 42',
      addressDescription: 'Офис в Ялте, Южный берег Крыма',
      workingHours: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00',
      workingHoursDescription: 'Воскресенье - выходной',
      officeName: 'Офис в Ялте',
      isActive: true,
      sortOrder: 2,
    },
    {
      code: 'alushta',
      name: 'Алушта',
      phone: '+79782944151',
      phoneFormatted: '+7 (978) 294 41 51',
      email: 'alushta@doorhan-crimea.ru',
      address: 'Алушта, ул. Ленина, 8',
      addressDescription: 'Офис в Алуште',
      workingHours: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00',
      workingHoursDescription: 'Воскресенье - выходной',
      officeName: 'Офис в Алуште',
      isActive: true,
      sortOrder: 3,
    },
    {
      code: 'sevastopol',
      name: 'Севастополь',
      phone: '+79782944152',
      phoneFormatted: '+7 (978) 294 41 52',
      email: 'sevastopol@doorhan-crimea.ru',
      address: 'Севастополь, ул. Большая Морская, 25',
      addressDescription: 'Офис и выставочный зал в Севастополе',
      workingHours: 'Пн-Пт: 9:00-18:00, Сб: 9:00-15:00',
      workingHoursDescription: 'Воскресенье - выходной',
      officeName: 'Офис в Севастополе',
      isActive: true,
      sortOrder: 4,
    },
  ];

  console.log('Добавление/обновление регионов...');
  
  for (const region of regionsData) {
    const result = await prisma.region.upsert({
      where: { code: region.code },
      update: region,
      create: region,
    });
    console.log(`✓ ${result.code}: ${result.name}`);
  }

  console.log(`\n✅ Обработано регионов: ${regionsData.length}`);
}

async function main() {
  try {
    await seedRegions();
  } catch (error) {
    console.error('Ошибка при добавлении регионов:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

