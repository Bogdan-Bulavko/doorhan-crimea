import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductPageClient from '@/components/ProductPageClient';

interface ProductPageProps {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  
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

  const title = product.seoTitle || `${product.name} | ${category.name} | DoorHan Крым`;
  const description = product.seoDescription || product.shortDescription || product.description || `Купить ${product.name} от DoorHan. ${category.name}. Качественные ворота и автоматические системы в Крыму.`;
  
  const mainImage = product.images?.[0]?.imageUrl || product.mainImageUrl;
  
  return {
    title,
    description,
    keywords: `${product.name}, ${category.name}, DoorHan, ворота, автоматика, Крым`,
    openGraph: {
      title,
      description,
      url: `https://doorhan-crimea/${categorySlug}/${productSlug}`,
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
      canonical: `https://doorhan-crimea/${categorySlug}/${productSlug}`,
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

export async function generateStaticParams() {
  const products = await db.product.findMany({
    where: { inStock: true },
    select: {
      slug: true,
      category: {
        select: { slug: true },
      },
    },
  });

  return products.map((product) => ({
    categorySlug: product.category.slug,
    productSlug: product.slug,
  }));
}
