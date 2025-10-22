/**
 * Утилиты для сериализации данных Prisma для передачи в Client Components
 */

interface PrismaProduct {
  id: number;
  name: string;
  title?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  mainImageUrl?: string | null;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  slug: string;
  sku?: string | null;
  price: unknown; // Decimal
  oldPrice?: unknown | null; // Decimal
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: unknown; // Decimal
  reviewsCount: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: Array<{
    id: number;
    imageUrl: string;
    altText?: string | null;
    sortOrder: number;
    isMain: boolean;
  }> | null;
  specifications?: Array<{
    id: number;
    name: string;
    value: string;
    unit?: string | null;
  }> | null;
  colors?: Array<{
    id: number;
    name: string;
    hexColor: string;
    imageUrl?: string | null;
    createdAt: Date;
    sortOrder: number;
    productId: number;
    value: string;
  }> | null;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeProduct(product: PrismaProduct) {
  return {
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
    rating: Number(product.rating),
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
    images:
      product.images?.map((img) => ({
        ...img,
        altText: img.altText || undefined,
      })) || [],
    // Сериализуем спецификации
    specifications:
      product.specifications?.map((spec) => ({
        ...spec,
        unit: spec.unit || undefined,
      })) || [],
    // Сериализуем цвета
    colors:
      product.colors?.map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.hexColor,
        imageUrl: color.imageUrl || undefined,
      })) || [],
  };
}

export function serializeProducts(products: PrismaProduct[]) {
  return products.map(serializeProduct);
}

interface PrismaCategory {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  slug: string;
  isActive: boolean;
  products?: PrismaProduct[];
}

export function serializeCategory(category: PrismaCategory) {
  return {
    ...category,
    description: category.description || undefined,
    imageUrl: category.imageUrl || undefined,
    seoTitle: category.seoTitle || undefined,
    seoDescription: category.seoDescription || undefined,
    // Сериализуем продукты в категории, если они есть
    products: category.products
      ? serializeProducts(category.products)
      : undefined,
  };
}
