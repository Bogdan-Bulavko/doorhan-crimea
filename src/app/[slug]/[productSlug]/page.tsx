import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import ProductPageClient from '@/components/ProductPageClient';
import {
  generateProductMetadata,
  getRegionFromHeaders,
} from '@/lib/metadata-generator';

interface ProductPageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug: categorySlug, productSlug } = await params;
  
  // Найти товар по slug категории и slug товара
  const product = await db.product.findFirst({
    where: {
      slug: productSlug,
      category: {
        slug: categorySlug,
        isActive: true,
      },
      inStock: true,
    },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!product) {
    return {
      title: 'Товар не найден',
    };
  }

  const headersList = await headers();
  const region = getRegionFromHeaders(headersList);

  const { title, description } = generateProductMetadata(
    product.name,
    Number(product.price),
    product.category.name,
    region
  );

  return {
    title,
    description,
    keywords: `${product.name}, ${product.category.name}, DoorHan, ворота, автоматика, Крым`,
    openGraph: {
      title,
      description,
      url: `https://doorhan-crimea/${categorySlug}/${productSlug}`,
      siteName: 'DoorHan Крым',
      images: product.mainImageUrl
        ? [
            {
              url: product.mainImageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : product.images && product.images.length > 0
        ? [
            {
              url: product.images[0].imageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
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
      images: product.mainImageUrl
        ? [product.mainImageUrl]
        : product.images && product.images.length > 0
        ? [product.images[0].imageUrl]
        : ['/doorhan-crimea/og-image.jpg'],
    },
    alternates: {
      canonical: `https://doorhan-crimea/${categorySlug}/${productSlug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug: categorySlug, productSlug } = await params;
  
  // Найти товар по slug категории и slug товара
  const product = await db.product.findFirst({
    where: {
      slug: productSlug,
      category: {
        slug: categorySlug,
        isActive: true,
      },
    },
    include: {
      category: true,
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

  // Сериализуем данные
  const serializedProduct = {
    ...product,
    price: Number(product.price),
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
    images: product.images?.map((img: { id: number; imageUrl: string; altText?: string | null; sortOrder: number; isMain: boolean }) => ({
      ...img,
      altText: img.altText || undefined,
    })) || [],
    specifications: product.specifications?.map((spec: { id: number; name: string; value: string; unit?: string | null; sortOrder: number }) => ({
      ...spec,
      unit: spec.unit || undefined,
    })) || [],
    colors: product.colors?.map((color: { id: number; name: string; value: string; hexColor: string; imageUrl?: string | null; sortOrder: number }) => ({
      ...color,
      imageUrl: color.imageUrl || undefined,
    })) || [],
  };

  const serializedCategory = {
    ...product.category,
    description: product.category.description || undefined,
    imageUrl: product.category.imageUrl || undefined,
    seoTitle: product.category.seoTitle || undefined,
    seoDescription: product.category.seoDescription || undefined,
  };

  return (
    <ProductPageClient 
      product={serializedProduct}
      category={serializedCategory}
    />
  );
}

