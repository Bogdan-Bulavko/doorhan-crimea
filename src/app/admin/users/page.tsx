export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Suspense } from 'react';
import { TableSkeleton } from '../_components/SkeletonLoader';

async function UsersTable() {
  const users = await db.user.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="p-3">ID</th>
            <th className="p-3">Email</th>
            <th className="p-3">Имя</th>
            <th className="p-3">Телефон</th>
            <th className="p-3">Роль</th>
            <th className="p-3">Статус</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-b last:border-0 hover:bg-gray-50 transition-colors"
            >
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                {u.firstName} {u.lastName}
              </td>
              <td className="p-3">{u.phone ?? '—'}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    u.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : u.role === 'manager'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    u.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {u.isActive ? 'Активен' : 'Отключён'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminUsersPage() {
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#00205B]">Пользователи</h1>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#001a4a] transition-colors"
        >
          Добавить пользователя
        </Link>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
