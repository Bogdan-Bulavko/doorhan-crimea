export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';

import Link from 'next/link';

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({ orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] });
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#00205B]">Категории</h1>
        <Link href="/admin/categories/new" className="px-4 py-2 rounded-lg bg-[#00205B] text-white text-sm">Добавить категорию</Link>
      </div>
      <div className="rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Название</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Родитель</th>
              <th className="p-3">Активна</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.slug}</td>
                <td className="p-3">{c.parentId ?? '—'}</td>
                <td className="p-3">{c.isActive ? 'Да' : 'Нет'}</td>
                <td className="p-3">
                  <Link href={`/admin/categories/${c.id}`} className="text-[#00205B] underline">Редактировать</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


