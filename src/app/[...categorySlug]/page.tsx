import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import CategoryProducts from '@/components/CategoryProducts';
import ProductPageClient from '@/components/ProductPageClient';
import type { ProductPageClientProps } from '@/components/ProductPageClient';
import { serializeCategory, serializeProducts } from '@/lib/serialization';
import {
  generateCategoryMetadata,
  generateProductMetadata,
  getRegionFromHeaders,
} from '@/lib/metadata-generator';
import { generateCanonical } from '@/lib/canonical-utils';
import { processShortcodes, getRegionData, type ShortcodeContext } from '@/lib/shortcodes';

interface PageProps {
  params: Promise<{ categorySlug: string[] }>;
}

// Делаем страницу динамической для доступа к headers()
export const dynamic = 'force-dynamic';

/**
 * Находит категорию по пути (поддерживает вложенность)
 * Примеры:
 * - ['avtomatika-dlya-vorot'] - основная категория
 * - ['avtomatika-dlya-vorot', 'sekcionnye'] - подкатегория
 */
async function findCategoryByPath(slugs: string[]) {
  if (slugs.length === 0) {
    return null;
  }

  // Начинаем с последнего slug (самая вложенная категория)
  const currentSlug = slugs[slugs.length - 1];
  const category = await db.category.findFirst({
    where: {
      slug: currentSlug,
      isActive: true,
    },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      products: {
        where: { inStock: true },
        select: {
          price: true,
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  // Проверяем путь: если есть parent, проверяем что путь соответствует
  if (slugs.length > 1) {
    const parentSlugs = slugs.slice(0, -1);
    let current = category;
    let pathIndex = parentSlugs.length - 1;

    // Проверяем путь от текущей категории вверх
    while (current.parent && pathIndex >= 0) {
      if (current.parent.slug !== parentSlugs[pathIndex]) {
        return null; // Путь не совпадает
      }
      // TypeScript требует явного приведения типа, так как parent может быть null
      current = current.parent as typeof category;
      pathIndex--;
    }

    // Если остались необработанные slugs, путь неверный
    if (pathIndex >= 0) {
      return null;
    }
  } else {
    // Если запрашивается основная категория, но у неё есть parent - это ошибка
    if (category.parentId) {
      return null;
    }
  }

  return category;
}

/**
 * Проверяет, является ли последний сегмент товаром
 */
async function findProductBySlug(
  productSlug: string, 
  categoryIds: number[]
): Promise<Awaited<ReturnType<typeof db.product.findFirst<{
  include: {
    category: { select: { id: true; name: true; slug: true } };
    images: true;
    specifications: true;
    colors: true;
  };
}>>>> {
  const product = await db.product.findFirst({
    where: {
      slug: productSlug,
      inStock: true,
      OR: [
        { categoryId: { in: categoryIds } },
        { categories: { some: { categoryId: { in: categoryIds } } } },
      ],
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

  return product;
}

/**
 * Строит полный путь категории для URL
 */
function buildCategoryPath(category: { slug: string; parent: { slug: string; parent: unknown } | null } | null): string[] {
  if (!category) return [];
  
  const path: string[] = [];
  // Используем type assertion для обхода рекурсивной структуры
  let current: { slug: string; parent: { slug: string; parent: unknown } | null } | null = category as { slug: string; parent: { slug: string; parent: unknown } | null } | null;
  
  while (current) {
    path.unshift(current.slug);
    // Type assertion для рекурсивной структуры
    current = (current.parent as { slug: string; parent: unknown } | null) as typeof current | null;
  }
  
  return path;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  
  // Получаем регион из заголовков
  const headersList = await headers();
  const region = getRegionFromHeaders(headersList);

  // Проверяем, является ли последний сегмент товаром
  const lastSegment = categorySlug[categorySlug.length - 1];
  const categoryPath = categorySlug.slice(0, -1);
  
  // Сначала пытаемся найти категорию по пути (без последнего сегмента)
  let category = categoryPath.length > 0 ? await findCategoryByPath(categoryPath) : null;
  
  // Если категория не найдена, пытаемся найти по всему пути
  if (!category) {
    category = await findCategoryByPath(categorySlug);
  }

  // Если категория найдена, проверяем последний сегмент - может быть товар
  if (category) {
    const categoryIds = [category.id, ...category.children.map(c => c.id)];
    const product = await findProductBySlug(lastSegment, categoryIds);
    
    if (product) {
      // Это товар
      // Получаем региональные данные для шорткодов
      const regionData = await getRegionData(region);
      const shortcodeContext: ShortcodeContext = {
        region: regionData || undefined,
        product: {
          name: product.name,
          price: Number(product.price),
          minPrice: product.minPrice ? Number(product.minPrice) : null,
          category: {
            name: product.category?.name || category.name,
          },
        },
      };

      const price = product.minPrice ? Number(product.minPrice) : (product.price ? Number(product.price) : null);
      const generatedMeta = generateProductMetadata(
        product.name,
        price,
        region,
        'DoorHan Крым',
        product.currency || 'RUB'
      );
      
      // Обрабатываем шорткоды в SEO полях
      const rawTitle = product.seoTitle?.trim() || generatedMeta.title;
      const rawDescription = product.seoDescription?.trim() || generatedMeta.description;
      const title = processShortcodes(rawTitle, shortcodeContext);
      const description = processShortcodes(rawDescription, shortcodeContext);
      const robots = product.robotsMeta?.trim() || 'index, follow';
      
      const mainImage = product.images?.[0]?.imageUrl || product.mainImageUrl;
      
      const categoryPathArray = buildCategoryPath(category as { slug: string; parent: { slug: string; parent: unknown } | null } | null);
      const categoryPathString = categoryPathArray.join('/');
      
      const productCanonicalUrl = product.canonicalUrl || `/${categoryPathString}/${lastSegment}`;
      
      const canonicalUrl = generateCanonical('product', region, {
        categorySlug: categoryPathString,
        productSlug: lastSegment,
        customCanonical: productCanonicalUrl,
        useFullUrl: true,
        forceMainDomain: true,
      });
      
      return {
        title,
        description,
        robots,
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
  }

  // Это категория
  if (!category) {
    return {
      title: 'Страница не найдена | DoorHan Крым',
      description: 'Запрашиваемая страница не найдена',
    };
  }

  // Конвертируем Decimal в number для функции генерации метатегов
  const productsWithPrices = category.products.map((p) => ({
    price: p.price ? Number(p.price) : null,
  }));

  // Получаем региональные данные для шорткодов
  const regionData = await getRegionData(region);
  const shortcodeContext: ShortcodeContext = {
    region: regionData || undefined,
    category: {
      name: category.name,
      description: category.description || null,
    },
  };

  // Генерируем метатеги по шаблону
  const generatedMeta = generateCategoryMetadata(
    category.name,
    productsWithPrices,
    region
  );
  
  // Обрабатываем шорткоды в SEO полях
  const rawTitle = category.seoTitle?.trim() || generatedMeta.title;
  const rawDescription = category.seoDescription?.trim() || generatedMeta.description;
  const title = processShortcodes(rawTitle, shortcodeContext);
  const description = processShortcodes(rawDescription, shortcodeContext);
  const robots = category.robotsMeta?.trim() || 'index, follow';

  // Строим полный путь для canonical
  const categoryPathArray = buildCategoryPath(category as { slug: string; parent: { slug: string; parent: unknown } | null } | null);
  const categoryPathString = categoryPathArray.join('/');

  // Генерируем canonical URL с учетом поддомена
  const canonicalUrl = generateCanonical('category', region, {
    categorySlug: categoryPathString,
    customCanonical: category.canonicalUrl,
    useFullUrl: true,
    forceMainDomain: true,
  });

  return {
    title,
    description,
    robots,
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

export default async function DynamicPage({ params }: PageProps) {
  const { categorySlug } = await params;

  // Проверяем, является ли последний сегмент товаром
  const lastSegment = categorySlug[categorySlug.length - 1];
  const categoryPath = categorySlug.slice(0, -1);
  
  // Сначала пытаемся найти категорию по пути (без последнего сегмента)
  let category = categoryPath.length > 0 ? await findCategoryByPath(categoryPath) : null;
  
  // Если категория не найдена, пытаемся найти по всему пути
  if (!category) {
    category = await findCategoryByPath(categorySlug);
  }

  // Если категория найдена, проверяем последний сегмент - может быть товар
  if (category) {
    const categoryIds = [category.id, ...category.children.map(c => c.id)];
    const product = await findProductBySlug(lastSegment, categoryIds);
    
    if (product) {
      // Это товар - показываем страницу товара
      const headersList = await headers();
      const regionCode = getRegionFromHeaders(headersList);
      const regionData = await getRegionData(regionCode);

      // Обрабатываем шорткоды в контенте товара
      const shortcodeContext: ShortcodeContext = {
        region: regionData || undefined,
        product: {
          name: product.name,
          price: Number(product.price),
          minPrice: product.minPrice ? Number(product.minPrice) : null,
          category: {
            name: product.category?.name || category.name,
          },
        },
      };

      // Обрабатываем шорткоды в описании товара и h1
      const processedDescription = processShortcodes(product.description, shortcodeContext);
      const processedShortDescription = processShortcodes(product.shortDescription, shortcodeContext);
      const processedH1 = processShortcodes(product.h1 || product.name, shortcodeContext);

      // Конвертируем Decimal в числа для клиентских компонентов
      const serializedProduct: ProductPageClientProps['product'] = {
        ...product,
        price: Number(product.price),
        minPrice: product.minPrice ? Number(product.minPrice) : undefined,
        oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
        rating: Number(product.rating),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        title: product.title || undefined,
        description: processedDescription || undefined,
        shortDescription: processedShortDescription || undefined,
        h1: processedH1 || undefined,
        mainImageUrl: product.mainImageUrl || undefined,
        sku: product.sku || undefined,
        seoTitle: product.seoTitle || undefined,
        seoDescription: product.seoDescription || undefined,
        canonicalUrl: product.canonicalUrl || undefined,
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

      // Строим полный путь категории для breadcrumbs
      const categoryPathArray = buildCategoryPath(category as { slug: string; parent: { slug: string; parent: unknown } | null } | null);

      // Сериализуем категорию
      const serializedCategory: ProductPageClientProps['category'] = {
        ...category,
        slug: categoryPathArray.join('/'), // Полный путь категории
        description: category.description || undefined,
        imageUrl: category.imageUrl || undefined,
        seoTitle: category.seoTitle || undefined,
        seoDescription: category.seoDescription || undefined,
        canonicalUrl: category.canonicalUrl || undefined,
        h1: category.h1 || undefined,
      };

      return (
        <main className="min-h-screen">
          <ProductPageClient 
            product={serializedProduct}
            category={serializedCategory}
          />
          {product.schemaMarkup && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: product.schemaMarkup }}
            />
          )}
        </main>
      );
    }
  }

  // Это категория - показываем страницу категории
  if (!category) {
    notFound();
  }

  // Получаем региональные данные для шорткодов
  const headersList = await headers();
  const regionCode = getRegionFromHeaders(headersList);
  const regionData = await getRegionData(regionCode);

  // Получаем товары категории (включая товары из подкатегорий если это основная категория)
  let products;
  if (category.children.length > 0) {
    // Если это основная категория с подкатегориями, показываем товары из всех подкатегорий
    const childCategoryIds = category.children.map(c => c.id);
    products = await db.product.findMany({
      where: {
        inStock: true,
        OR: [
          { categoryId: category.id },
          { categories: { some: { categoryId: { in: childCategoryIds } } } },
        ],
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        specifications: true,
        colors: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    // Если это подкатегория или категория без детей, показываем только её товары
    products = await db.product.findMany({
      where: {
        inStock: true,
        OR: [
          { categoryId: category.id },
          { categories: { some: { categoryId: category.id } } },
        ],
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        specifications: true,
        colors: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Обрабатываем шорткоды в контенте
  const shortcodeContext: ShortcodeContext = {
    region: regionData || undefined,
    category: {
      name: category.name,
      description: category.description || null,
    },
  };

  // Обрабатываем шорткоды во всех полях
  const processedContentTop = processShortcodes(category.contentTop, shortcodeContext);
  const processedContentBottom = processShortcodes(category.contentBottom, shortcodeContext);
  const processedH1 = processShortcodes(category.h1 || category.name, shortcodeContext);
  const processedDescription = processShortcodes(category.description, shortcodeContext);

  // Сериализуем данные для передачи в Client Components
  const serializedProducts = serializeProducts(products);
  const serializedCategory = serializeCategory({
    id: category.id,
    name: category.name,
    description: processedDescription,
    imageUrl: category.imageUrl,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    canonicalUrl: category.canonicalUrl,
    h1: processedH1,
    contentTop: processedContentTop,
    contentBottom: processedContentBottom,
    slug: category.slug,
    isActive: category.isActive,
  });

  return (
    <main className="min-h-screen">
      <CategoryProducts
        category={serializedCategory}
        products={serializedProducts}
        subcategories={category.children.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
        }))}
        parentCategory={category.parent ? {
          id: category.parent.id,
          name: category.parent.name,
          slug: category.parent.slug,
        } : null}
      />
      {category.schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: category.schemaMarkup }}
        />
      )}
    </main>
  );
}
