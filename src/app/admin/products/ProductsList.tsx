'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeleteModal from '../_components/DeleteModal';

type Product = {
  id: number;
  name: string;
  price: string; // Converted from Decimal
  currency: string;
  inStock: boolean;
  category?: { name: string } | null;
};

interface ProductsListProps {
  products: Product[];
}

export default function ProductsList({ products }: ProductsListProps) {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({ isOpen: false, product: null });

  const handleDelete = async (product: Product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;

    try {
      const res = await fetch(`/api/admin/products/${deleteModal.product.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Ошибка удаления товара');
      }
    } catch {
      alert('Ошибка удаления товара');
    }
  };

  return (
    <>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#00205B]">Товары</h1>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 rounded-lg bg-[#00205B] text-white text-sm"
          >
            Добавить товар
          </Link>
        </div>

        <div className="rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-3">ID</th>
                <th className="p-3">Название</th>
                <th className="p-3">Категория</th>
                <th className="p-3">Цена</th>
                <th className="p-3">Наличие</th>
                <th className="p-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category?.name ?? '—'}</td>
                  <td className="p-3">
                    {p.price} {p.currency}
                  </td>
                  <td className="p-3">{p.inStock ? 'В наличии' : 'Нет'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-[#00205B] underline"
                      >
                        Редактировать
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-red-600 hover:underline"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={confirmDelete}
        title="Удалить товар"
        message="Вы уверены, что хотите удалить товар"
        itemName={deleteModal.product?.name || ''}
      />
    </>
  );
}
