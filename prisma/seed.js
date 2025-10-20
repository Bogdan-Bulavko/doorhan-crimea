/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.adminLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.contactForm.deleteMany();
  await prisma.callbackRequest.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash('admin12345', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@local.test',
      passwordHash,
      firstName: 'Админ',
      lastName: 'Пользователь',
      role: 'admin',
      isActive: true,
    },
  });
  return { admin };
}

async function seedCategoriesAndProducts() {
  const categoriesData = [
    {
      name: 'Распашные ворота',
      slug: 'swing-gates',
      description: 'Надёжные распашные ворота для частного и промышленного использования',
      imageUrl: '/window.svg',
      color: '#00205B',
      hoverColor: '#0A2E8A',
    },
    {
      name: 'Секционные ворота',
      slug: 'sectional-gates',
      description: 'Тёплые и тихие секционные ворота с отличной теплоизоляцией',
      imageUrl: '/window.svg',
      color: '#0B6E4F',
      hoverColor: '#0E9168',
    },
    {
      name: 'Автоматика',
      slug: 'automation',
      description: 'Приводы и аксессуары DoorHan для автоматизации ворот',
      imageUrl: '/window.svg',
      color: '#8A580A',
      hoverColor: '#B1730D',
    },
  ];

  const categories = await Promise.all(
    categoriesData.map((c, i) =>
      prisma.category.create({ data: { ...c, sortOrder: i } })
    )
  );

  const [swing, sectional, automation] = categories;

  const productsData = [
    {
      name: 'DoorHan Swing-5000',
      title: 'Распашные ворота Swing-5000',
      description: 'Комплект распашных ворот DoorHan с надёжной автоматикой.',
      shortDescription: 'Сталь, порошковая окраска',
      mainImageUrl: '/window.svg',
      categoryId: swing.id,
      slug: 'doorhan-swing-5000',
      sku: 'DH-SW-5000',
      price: '45000',
      oldPrice: '49900',
      inStock: true,
      stockQuantity: 12,
      isPopular: true,
      rating: '4.6',
      images: [
        { imageUrl: '/window.svg', altText: 'Swing-5000 вид спереди', sortOrder: 0, isMain: true },
        { imageUrl: '/globe.svg', altText: 'Swing-5000 комплект', sortOrder: 1 },
      ],
      specifications: [
        { name: 'Ширина проёма', value: '3.0', unit: 'м', sortOrder: 0 },
        { name: 'Высота', value: '2.0', unit: 'м', sortOrder: 1 },
        { name: 'Материал', value: 'Сталь', sortOrder: 2 },
      ],
      colors: [
        { name: 'Белый', value: 'white', hexColor: '#FFFFFF', sortOrder: 0 },
        { name: 'Серый', value: 'grey', hexColor: '#9CA3AF', sortOrder: 1 },
      ],
    },
    {
      name: 'DoorHan SectionPro',
      title: 'Секционные ворота SectionPro',
      description: 'Тёплые секционные ворота с высоким ресурсом.',
      shortDescription: 'Панель 40 мм, торсионный механизм',
      mainImageUrl: '/window.svg',
      categoryId: sectional.id,
      slug: 'doorhan-sectionpro',
      sku: 'DH-SE-PR',
      price: '76000',
      inStock: true,
      stockQuantity: 5,
      isFeatured: true,
      rating: '4.8',
      images: [
        { imageUrl: '/window.svg', altText: 'SectionPro общий вид', sortOrder: 0, isMain: true },
      ],
      specifications: [
        { name: 'Толщина панели', value: '40', unit: 'мм', sortOrder: 0 },
        { name: 'Теплопроводность', value: '0.5', unit: 'Вт/м²·К', sortOrder: 1 },
      ],
      colors: [
        { name: 'Коричневый', value: 'brown', hexColor: '#6B4423', sortOrder: 0 },
      ],
    },
    {
      name: 'Привод Sectional-750',
      title: 'Автоматика для секционных ворот',
      description: 'Бесшумный привод для ворот до 12 м².',
      shortDescription: 'Ременная передача',
      mainImageUrl: '/window.svg',
      categoryId: automation.id,
      slug: 'sectional-750-drive',
      sku: 'DH-DR-750',
      price: '18900',
      inStock: true,
      stockQuantity: 25,
      isNew: true,
      rating: '4.4',
      images: [
        { imageUrl: '/window.svg', altText: 'Sectional-750 привод', sortOrder: 0, isMain: true },
      ],
      specifications: [
        { name: 'Мощность', value: '120', unit: 'Вт', sortOrder: 0 },
        { name: 'Скорость', value: '0.1', unit: 'м/с', sortOrder: 1 },
      ],
      colors: [
        { name: 'Чёрный', value: 'black', hexColor: '#111827', sortOrder: 0 },
      ],
    },
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: {
        name: p.name,
        title: p.title,
        description: p.description,
        shortDescription: p.shortDescription,
        mainImageUrl: p.mainImageUrl,
        categoryId: p.categoryId,
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        oldPrice: p.oldPrice,
        inStock: p.inStock,
        stockQuantity: p.stockQuantity,
        isNew: p.isNew,
        isPopular: p.isPopular,
        isFeatured: p.isFeatured,
        rating: p.rating,
        images: { create: p.images },
        specifications: { create: p.specifications },
        colors: { create: p.colors },
      },
    });
  }
}

async function seedContent(admin) {
  // Upsert settings individually (SQLite does not support skipDuplicates on createMany)
  const settings = [
    { key: 'site_name', value: 'DoorHan Крым', description: 'Название сайта' },
    { key: 'contact_phone', value: '+7 (978) 000-00-00', description: null },
    { key: 'contact_email', value: 'info@doorhan-crimea.test', description: null },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description ?? undefined },
      create: { key: s.key, value: s.value, description: s.description ?? undefined },
    });
  }

  await prisma.contactForm.create({
    data: {
      name: 'Иван Петров',
      email: 'ivan@example.com',
      phone: '+7 999 111-22-33',
      subject: 'Подбор ворот',
      message: 'Нужна консультация по секционным воротам 3x2.5 м',
      status: 'new',
    },
  });

  await prisma.callbackRequest.create({
    data: {
      name: 'Мария',
      phone: '+7 978 555-55-55',
      preferredTime: 'после 18:00',
      message: 'Перезвоните, хочу уточнить сроки поставки',
      status: 'new',
    },
  });

  const oneProduct = await prisma.product.findFirst({});
  if (oneProduct) {
    await prisma.order.create({
      data: {
        orderNumber: 'DH-000001',
        userId: admin.id,
        customerInfo: { name: 'ООО Ромашка', contact: '+7 978 000-00-01' },
        shippingAddress: { city: 'Симферополь', address: 'ул. Киевская, 1' },
        billingAddress: { inn: '1234567890' },
        subtotal: oneProduct.price,
        shippingCost: '1500',
        tax: '0',
        discount: '0',
        total: String(Number(oneProduct.price) + 1500),
        currency: 'RUB',
        items: {
          create: [
            {
              productId: oneProduct.id,
              quantity: 1,
              price: oneProduct.price,
              totalPrice: oneProduct.price,
            },
          ],
        },
      },
    });
  }
}

async function main() {
  console.log('Seeding database...');
  await clearDatabase();
  const { admin } = await seedUsers();
  await seedCategoriesAndProducts();
  await seedContent(admin);
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


