import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 Product API: ищем продукт с id/slug:', id);
    
    let product = null;

    // Сначала пытаемся найти по slug (для строковых идентификаторов)
    if (isNaN(Number(id))) {
      product = await db.product.findFirst({
        where: { slug: id },
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
    } else {
      // Если это число, ищем по ID
      product = await db.product.findUnique({
        where: { id: parseInt(id) },
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
    }

    if (!product) {
      console.log('❌ Product API: продукт не найден для id/slug:', id);
      return NextResponse.json(
        {
          success: false,
          message: 'Товар не найден',
        },
        { status: 404 }
      );
    }

    console.log('✅ Product API: продукт найден:', product.name);

    // Convert Decimal to numbers for client components
    const serializedProduct = {
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
      rating: Number(product.rating),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      // Convert null to undefined for interface compatibility
      title: product.title || undefined,
      description: product.description || undefined,
      shortDescription: product.shortDescription || undefined,
      mainImageUrl: product.mainImageUrl || undefined,
      sku: product.sku || undefined,
      seoTitle: product.seoTitle || undefined,
      seoDescription: product.seoDescription || undefined,
      // Serialize images
      images: product.images?.map(img => ({
        ...img,
        altText: img.altText || undefined,
      })) || [],
      // Serialize specifications
      specifications: product.specifications?.map(spec => ({
        ...spec,
        unit: spec.unit || undefined,
      })) || [],
      // Serialize colors
      colors: product.colors?.map(color => ({
        ...color,
        imageUrl: color.imageUrl || undefined,
      })) || [],
    };

    return NextResponse.json({
      success: true,
      data: serializedProduct,
    });
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении товара',
      },
      { status: 500 }
    );
  }
}
