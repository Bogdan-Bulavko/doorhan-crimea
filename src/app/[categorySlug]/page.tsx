import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import CategoryProducts from '@/components/CategoryProducts';
import { serializeCategory, serializeProducts } from '@/lib/serialization';
import {
  generateCategoryMetadata,
  getRegionFromHeaders,
} from '@/lib/metadata-generator';
import { generateCanonical } from '@/lib/canonical-utils';

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

// Делаем страницу динамической для доступа к headers()
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  
  // Получаем регион из заголовков
  const headersList = await headers();
  const region = getRegionFromHeaders(headersList);

  const category = await db.category.findFirst({
    where: {
      slug: categorySlug,
      isActive: true,
    },
    include: {
      products: {
        where: { inStock: true },
        select: {
          price: true,
        },
      },
    },
  });

  if (!category) {
    return {
      title: 'Категория не найдена | DoorHan Крым',
      description: 'Запрашиваемая категория не найдена',
    };
  }

  // Конвертируем Decimal в number для функции генерации метатегов
  const productsWithPrices = category.products.map((p) => ({
    price: p.price ? Number(p.price) : null,
  }));

  // Генерируем метатеги по шаблону
  const { title, description } = generateCategoryMetadata(
    category.name,
    productsWithPrices,
    region
  );

  // Генерируем canonical URL с учетом поддомена
  const canonicalUrl = generateCanonical('category', region, {
    categorySlug,
    customCanonical: category.canonicalUrl,
    useFullUrl: true,
    forceMainDomain: true, // Всегда используем основной домен для canonical
  });

  return {
    title,
    description,
    keywords: `${category.name}, DoorHan, ворота, автоматика, Крым`,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'DoorHan Крым',
      images: category.imageUrl
        ? [
            {
              url: category.imageUrl,
              width: 1200,
              height: 630,
              alt: category.name,
            },
          ]
        : [
            {
              url: '/doorhan-crimea/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'DoorHan Крым',
            },
          ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: category.imageUrl
        ? [category.imageUrl]
        : ['/doorhan-crimea/og-image.jpg'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  // Найти категорию по slug
  const category = await db.category.findFirst({
    where: {
      slug: categorySlug,
      isActive: true,
    },
    include: {
      products: {
        where: { inStock: true },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          specifications: true,
          colors: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Сериализуем данные для передачи в Client Components
  const serializedProducts = serializeProducts(category.products);
  const serializedCategory = serializeCategory(category);

  return (
    <main className="min-h-screen">
      <CategoryProducts
        category={serializedCategory}
        products={serializedProducts}
      />
    </main>
  );
}

// Удаляем generateStaticParams, так как страница теперь динамическая
