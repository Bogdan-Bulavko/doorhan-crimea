import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true, images: true, specifications: true, colors: true },
  });
  return NextResponse.json({ success: true, data: product });
}

const specificationSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

const imageSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  url: z.string(),
  type: z.enum(['image', 'video']),
  size: z.number(),
  originalName: z.string(),
  isMain: z.boolean().optional(),
  sortOrder: z.number(),
  altText: z.string().optional(),
});

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  mainImageUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.number().optional(),
  slug: z.string().min(1).optional(),
  sku: z.string().optional(),
  price: z.coerce.number().optional(),
  oldPrice: z.coerce.number().optional(),
  currency: z.string().optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().optional(),
  isNew: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  h1: z.string().optional(),
  robotsMeta: z.string().optional(),
  schemaMarkup: z.string().optional(),
  specifications: z.array(specificationSchema).optional(),
  images: z.array(imageSchema).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    const body = await req.json();
    const data = productUpdateSchema.parse(body);
    
    // Извлекаем характеристики и изображения из данных
    const { specifications, images, ...productData } = data;
    
    // Определяем основное изображение
    const mainImage = images?.find(img => img.isMain);
    const mainImageUrl = mainImage?.url || productData.mainImageUrl;
    
    // Обновляем товар с характеристиками и изображениями
    const product = await db.product.update({
      where: { id },
      data: {
        ...productData,
        mainImageUrl,
        specifications: specifications ? {
          deleteMany: {}, // Удаляем все существующие характеристики
          create: specifications.map((spec, index) => ({
            name: spec.name,
            value: spec.value,
            unit: spec.unit || null,
            sortOrder: spec.sortOrder ?? index,
          }))
        } : undefined,
        images: images ? {
          deleteMany: {}, // Удаляем все существующие изображения
          create: images.map((img, index) => ({
            imageUrl: img.url,
            altText: img.altText || img.originalName,
            sortOrder: img.sortOrder ?? index,
            isMain: img.isMain || false,
          }))
        } : undefined,
      },
      include: {
        category: true,
        images: true,
        specifications: true,
        colors: true,
      },
    });
    
    // Инвалидируем кэш для страницы товара
    revalidatePath(`/${product.category.slug}/${product.slug}`, 'page');
    // Инвалидируем страницу категории (список товаров)
    revalidatePath(`/${product.category.slug}`, 'page');
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Product update error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    
    console.log('🔍 Удаление товара с ID:', id);
    
    // Проверяем, существует ли товар
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        specifications: true,
        colors: true,
        orderItems: true,
      },
    });
    
    if (!product) {
      return NextResponse.json({ success: false, message: 'Товар не найден' }, { status: 404 });
    }
    
    console.log('🔍 Найден товар для удаления:', {
      id: product.id,
      name: product.name,
      imagesCount: product.images.length,
      specificationsCount: product.specifications.length,
      colorsCount: product.colors.length,
      orderItemsCount: product.orderItems.length,
    });
    
    // Сохраняем данные для revalidation перед удалением
    const categorySlug = product.category.slug;
    const productSlug = product.slug;
    
    // Удаляем товар (каскадное удаление обработает связанные записи)
    await db.product.delete({ where: { id } });
    
    console.log('✅ Товар успешно удален');
    
    // Инвалидируем кэш
    revalidatePath(`/${categorySlug}/${productSlug}`, 'page');
    revalidatePath(`/${categorySlug}`, 'page');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка при удалении товара:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

