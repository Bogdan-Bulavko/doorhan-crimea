import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import ProductPageClient from '@/components/ProductPageClient';
import {
  generateProductMetadata,
  getRegionFromHeaders,
} from '@/lib/metadata-generator';
import { generateCanonical } from '@/lib/canonical-utils';

interface ProductPageProps {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

// Делаем страницу динамической для доступа к headers()
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  
  // Получаем регион из заголовков
  const headersList = await headers();
  const region = getRegionFromHeaders(headersList);
  
  // Найти категорию
  const category = await db.category.findFirst({
    where: { 
      slug: categorySlug,
      isActive: true 
    },
  });

  if (!category) {
    return {
      title: 'Товар не найден | DoorHan Крым',
      description: 'Запрашиваемый товар не найден',
    };
  }

  // Найти товар
  const product = await db.product.findFirst({
    where: { 
      slug: productSlug,
      categoryId: category.id,
      inStock: true 
    },
    include: {
      images: {
        where: { isMain: true },
        take: 1,
      },
    },
  });

  if (!product) {
    return {
      title: 'Товар не найден | DoorHan Крым',
      description: 'Запрашиваемый товар не найден',
    };
  }

  // Генерируем метатеги по шаблону
  const { title, description } = generateProductMetadata(
    product.name,
    product.price ? Number(product.price) : null,
    region,
    'DoorHan Крым',
    product.currency || 'RUB'
  );
  
  const mainImage = product.images?.[0]?.imageUrl || product.mainImageUrl;
  
  // Генерируем canonical URL с учетом поддомена
  const canonicalUrl = generateCanonical('product', region, {
    categorySlug,
    productSlug,
    customCanonical: product.canonicalUrl,
    useFullUrl: true,
    forceMainDomain: true, // Всегда используем основной домен для canonical
  });
  
  return {
    title,
    description,
    keywords: `${product.name}, ${category.name}, DoorHan, ворота, автоматика, Крым`,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'DoorHan Крым',
      images: mainImage ? [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ] : [
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
      images: mainImage ? [mainImage] : ['/doorhan-crimea/og-image.jpg'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { categorySlug, productSlug } = await params;

  // Найти категорию
  const category = await db.category.findFirst({
    where: { 
      slug: categorySlug,
      isActive: true 
    },
  });

  if (!category) {
    notFound();
  }

  // Найти товар
  const product = await db.product.findFirst({
    where: { 
      slug: productSlug,
      categoryId: category.id,
      inStock: true 
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      specifications: true,
      colors: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Конвертируем Decimal в числа для клиентских компонентов
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
    rating: Number(product.rating),
    // Конвертируем все Decimal поля
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    // Конвертируем null в undefined для совместимости с интерфейсом
    title: product.title || undefined,
    description: product.description || undefined,
    shortDescription: product.shortDescription || undefined,
    mainImageUrl: product.mainImageUrl || undefined,
    sku: product.sku || undefined,
    seoTitle: product.seoTitle || undefined,
    seoDescription: product.seoDescription || undefined,
    // Сериализуем изображения
    images: product.images?.map(img => ({
      ...img,
      altText: img.altText || undefined,
    })) || [],
    // Сериализуем спецификации
    specifications: product.specifications?.map(spec => ({
      ...spec,
      unit: spec.unit || undefined,
    })) || [],
    // Сериализуем цвета
    colors: product.colors?.map(color => ({
      ...color,
      imageUrl: color.imageUrl || undefined,
    })) || [],
  };

  // Сериализуем категорию
  const serializedCategory = {
    ...category,
    description: category.description || undefined,
    imageUrl: category.imageUrl || undefined,
    seoTitle: category.seoTitle || undefined,
    seoDescription: category.seoDescription || undefined,
  };

  return (
    <main className="min-h-screen">
      <ProductPageClient 
        product={serializedProduct}
        category={serializedCategory}
      />
    </main>
  );
}

// Удаляем generateStaticParams, так как страница теперь динамическая
