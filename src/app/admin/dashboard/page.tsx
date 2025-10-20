import { db } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Get comprehensive statistics
  const [
    totalUsers,
    activeUsers,
    totalProducts,
    inStockProducts,
    totalCategories,
    activeCategories,
    totalOrders,
    pendingOrders,
    recentOrders,
    recentUsers
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.product.count(),
    db.product.count({ where: { inStock: true } }),
    db.category.count(),
    db.category.count({ where: { isActive: true } }),
    db.order.count(),
    db.order.count({ where: { status: 'pending' } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } }
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true }
    })
  ]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Панель управления</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900">Пользователи</h3>
          <p className="text-3xl font-bold text-[#00205B]">{totalUsers}</p>
          <p className="text-sm text-gray-600">Активных: {activeUsers}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900">Товары</h3>
          <p className="text-3xl font-bold text-[#00205B]">{totalProducts}</p>
          <p className="text-sm text-gray-600">В наличии: {inStockProducts}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900">Категории</h3>
          <p className="text-3xl font-bold text-[#00205B]">{totalCategories}</p>
          <p className="text-sm text-gray-600">Активных: {activeCategories}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900">Заказы</h3>
          <p className="text-3xl font-bold text-[#00205B]">{totalOrders}</p>
          <p className="text-sm text-gray-600">Ожидают: {pendingOrders}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние заказы</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">Заказ #{order.id}</p>
                  <p className="text-sm text-gray-600">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Новые пользователи</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/products/new" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📦</div>
            <p className="font-medium">Добавить товар</p>
          </Link>
          <Link href="/admin/categories/new" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📂</div>
            <p className="font-medium">Добавить категорию</p>
          </Link>
          <Link href="/admin/users/new" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">👤</div>
            <p className="font-medium">Добавить пользователя</p>
          </Link>
          <Link href="/admin/orders" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-medium">Просмотр заказов</p>
          </Link>
        </div>
      </div>
    </div>
  );
}


