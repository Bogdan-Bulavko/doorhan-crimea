import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductPageClient from '@/components/ProductPageClient';
import type { ProductPageClientProps } from '@/components/ProductPageClient';

// Обязательно для статического экспорта
export const dynamic = 'force-static';

// Генерируем статические параметры для всех возможных товаров
export async function generateStaticParams() {
  try {
    // Получаем все товары из базы данных
    const products = await db.product.findMany({
      select: { id: true, slug: true },
    });

    console.log('🔍 generateStaticParams: найдено товаров:', products.length);

    return products.map((product) => ({
      'page-product': product.slug || product.id.toString(),
    }));
  } catch (error) {
    console.error('Ошибка при генерации статических параметров:', error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
}

export default async function PageProduct({
  params,
}: {
  params: Promise<{ 'page-product': string }>;
}) {
  const { 'page-product': productId } = await params;
  
  // Найти товар по slug или ID
  let product = null;
  
  if (isNaN(Number(productId))) {
    // Если это строка, ищем по slug
    product = await db.product.findFirst({
      where: { slug: productId },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        specifications: true,
        colors: true,
      },
    });
  } else {
    // Если это число, ищем по ID
    product = await db.product.findUnique({
      where: { id: parseInt(productId) },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        specifications: true,
        colors: true,
      },
    });
  }

  if (!product) {
    notFound();
  }

  // Сериализуем данные
  const serializedProduct: ProductPageClientProps['product'] = {
    ...product,
    price: Number(product.price),
    minPrice: product.minPrice ? Number(product.minPrice) : undefined,
    oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
    rating: Number(product.rating),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    title: product.title || undefined,
    description: product.description || undefined,
    shortDescription: product.shortDescription || undefined,
    mainImageUrl: product.mainImageUrl || undefined,
    sku: product.sku || undefined,
    seoTitle: product.seoTitle || undefined,
    seoDescription: product.seoDescription || undefined,
    canonicalUrl: product.canonicalUrl || undefined,
    h1: product.h1 || undefined,
    images: product.images?.map(img => ({
      ...img,
      altText: img.altText || undefined,
    })) || [],
    specifications: product.specifications?.map(spec => ({
      ...spec,
      unit: spec.unit || undefined,
    })) || [],
    colors: product.colors?.map(color => ({
      ...color,
      imageUrl: color.imageUrl || undefined,
    })) || [],
  };

  const serializedCategory: ProductPageClientProps['category'] = {
    ...product.category,
    description: product.category.description || undefined,
    imageUrl: product.category.imageUrl || undefined,
    seoTitle: product.category.seoTitle || undefined,
    seoDescription: product.category.seoDescription || undefined,
    canonicalUrl: product.category.canonicalUrl || undefined,
    h1: product.category.h1 || undefined,
  };

  return (
    <ProductPageClient 
      product={serializedProduct}
      category={serializedCategory}
    />
  );
}
