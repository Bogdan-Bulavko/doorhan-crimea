import { redirect } from 'next/navigation';

export default function ProductsPage() {
  // Перенаправляем на страницу категорий
  redirect('/categories');
}
