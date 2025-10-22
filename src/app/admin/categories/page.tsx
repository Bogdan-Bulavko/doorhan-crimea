import { db } from '@/lib/db';
import CategoriesList from './CategoriesList';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      children: true,
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          oldPrice: true,
          currency: true,
          inStock: true,
          createdAt: true,
        },
      },
    },
  });

  // Сериализуем данные для передачи в Client Component
  const serializedCategories = categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({
      ...product,
      price: product.price.toString(),
      oldPrice: product.oldPrice?.toString() || null,
    })),
    children: category.children.map((child) => ({
      ...child,
      children: [],
      products: [],
    })),
  }));

  return <CategoriesList initialCategories={serializedCategories} />;
}
