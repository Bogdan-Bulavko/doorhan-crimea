import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CategoryProducts from '@/components/CategoryProducts';
import { serializeCategory, serializeProducts } from '@/lib/serialization';

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;

  const category = await db.category.findFirst({
    where: {
      slug: categorySlug,
      isActive: true,
    },
  });

  if (!category) {
    return {
      title: 'Категория не найдена | DoorHan Крым',
      description: 'Запрашиваемая категория не найдена',
    };
  }

  const title = category.seoTitle || `${category.name} | DoorHan Крым`;
  const description =
    category.seoDescription ||
    category.description ||
    `Каталог товаров категории ${category.name} от DoorHan. Качественные ворота и автоматические системы.`;

  return {
    title,
    description,
    keywords: `${category.name}, DoorHan, ворота, автоматика, Крым`,
    openGraph: {
      title,
      description,
      url: `https://doorhan-crimea/${categorySlug}`,
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
      canonical: `https://doorhan-crimea/${categorySlug}`,
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

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return categories.map((category) => ({
    categorySlug: category.slug,
  }));
}
