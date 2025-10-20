export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Заказы</h1>
      <div className="rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-3">№</th>
              <th className="p-3">Клиент</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Оплата</th>
              <th className="p-3">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-3">{o.orderNumber}</td>
                <td className="p-3">{o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Гость'}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">{o.paymentStatus}</td>
                <td className="p-3">{o.total.toString()} {o.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


