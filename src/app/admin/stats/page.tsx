export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';

export default async function AdminStatsPage() {
  const [totalProducts, totalCategories, totalOrders, totalCustomers] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.order.count(),
    db.user.count(),
  ]);
  const stats = [
    { label: 'Товары', value: totalProducts },
    { label: 'Категории', value: totalCategories },
    { label: 'Заказы', value: totalOrders },
    { label: 'Клиенты', value: totalCustomers },
  ];
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Статистика</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-4">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


