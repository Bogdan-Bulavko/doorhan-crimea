import { db } from '@/lib/db';
import ProductsList from './ProductsList';

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
  
  // Convert Decimal to string for client components
  const serializedProducts = products.map(product => ({
    ...product,
    price: product.price.toString(),
    oldPrice: product.oldPrice?.toString() || null,
    rating: product.rating?.toString() || null,
  }));
  
  return <ProductsList products={serializedProducts} />;
}


