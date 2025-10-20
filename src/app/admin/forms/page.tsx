export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';

export default async function AdminFormsPage() {
  const [contacts, callbacks] = await Promise.all([
    db.contactForm.findMany({ orderBy: { createdAt: 'desc' } }),
    db.callbackRequest.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Формы</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white">
          <div className="p-3 font-semibold border-b">Контактные формы</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-3">Имя</th>
                <th className="p-3">Email</th>
                <th className="p-3">Тема</th>
                <th className="p-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((f) => (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="p-3">{f.name}</td>
                  <td className="p-3">{f.email}</td>
                  <td className="p-3">{f.subject}</td>
                  <td className="p-3">{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border bg-white">
          <div className="p-3 font-semibold border-b">Заявки на звонок</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-3">Имя</th>
                <th className="p-3">Телефон</th>
                <th className="p-3">Время</th>
                <th className="p-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {callbacks.map((f) => (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="p-3">{f.name}</td>
                  <td className="p-3">{f.phone}</td>
                  <td className="p-3">{f.preferredTime ?? '—'}</td>
                  <td className="p-3">{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


