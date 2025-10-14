import ProductPageClient from './ProductPageClient';

// Обязательно для статического экспорта
export const dynamic = 'force-static';

// Генерируем статические параметры для всех возможных товаров
export async function generateStaticParams() {
  // Пример списка товаров - замените на реальные данные из API
  const products = [
    { 'page-product': '1' },
    { 'page-product': '2' },
    { 'page-product': '3' },
    { 'page-product': '4' },
  ];

  return products;
}

export default function PageProduct() {
  return <ProductPageClient />;
}
