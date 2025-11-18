import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import CategoryProducts from '@/components/CategoryProducts';
import { serializeCategory, serializeProducts } from '@/lib/serialization';
import {
  generateCategoryMetadata,
} from '@/lib/metadata-generator';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    if (!slug || slug === '' || slug === '/') {
      return {
        title: 'Страница не найдена',
      };
    }
    
    const headersList = await headers();
    const region = headersList.get('x-region') || 'default';

    // Проверяем только категорию
    const category = await db.category.findFirst({
      where: {
        slug: slug,
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
        title: 'Страница не найдена',
      };
    }

    // Конвертируем Decimal в number для функции генерации метатегов
    const productsWithPrices = category.products.map((p: { price: unknown }) => ({
      price: p.price ? Number(p.price) : null,
    }));

    // Генерируем метатеги по шаблону
    const { title, description } = generateCategoryMetadata(
      category.name,
      productsWithPrices,
      region
    );

    return {
      title,
      description,
      keywords: `${category.name}, DoorHan, ворота, автоматика, Крым`,
      openGraph: {
        title,
        description,
        url: `https://doorhan-crimea/${slug}`,
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
        canonical: `https://doorhan-crimea/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for category:', error);
    return {
      title: 'Страница не найдена',
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const { slug } = await params;

    if (!slug || slug === '' || slug === '/') {
      notFound();
    }

    // Проверяем только категорию
    const category = await db.category.findFirst({
      where: {
        slug: slug,
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
  } catch (error) {
    console.error('Error rendering category page:', error);
    notFound();
  }
}
