'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewRegionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    phoneFormatted: '',
    email: '',
    address: '',
    addressDescription: '',
    workingHours: '',
    workingHoursDescription: '',
    mapIframe: '',
    officeName: '',
    isActive: true,
    sortOrder: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    }));
  };

  const submit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const body = {
        ...formData,
        addressDescription: formData.addressDescription || undefined,
        workingHoursDescription: formData.workingHoursDescription || undefined,
        mapIframe: formData.mapIframe || undefined,
        officeName: formData.officeName || undefined,
      };

      const res = await fetch('/api/admin/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const j = await res.json();
      if (j.success) {
        router.replace('/admin/regions');
      } else {
        setError(j.message || 'Ошибка сохранения');
      }
    } catch {
      setError('Ошибка при сохранении региона');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Добавить регион</h1>
        <p className="text-gray-600 mt-1">
          Создание нового регионального офиса
        </p>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Код региона *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="simferopol"
            />
            <p className="text-xs text-gray-500 mt-1">
              Уникальный код для поддомена (например: simferopol, yalta)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название региона *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Симферополь"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+79782944149"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон (форматированный) *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
              name="phoneFormatted"
              value={formData.phoneFormatted}
              onChange={handleChange}
              placeholder="+7 (978) 294 41 49"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="info@doorhan-crimea.ru"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Адрес *
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Симферополь, ул. Примерная, 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание адреса
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            name="addressDescription"
            value={formData.addressDescription}
            onChange={handleChange}
            placeholder="Офис и выставочный зал"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Режим работы *
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            name="workingHours"
            value={formData.workingHours}
            onChange={handleChange}
            placeholder="Пн-Пт: 9:00-18:00, Сб: 9:00-15:00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание режима работы
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            name="workingHoursDescription"
            value={formData.workingHoursDescription}
            onChange={handleChange}
            placeholder="Воскресенье - выходной"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название офиса
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            name="officeName"
            value={formData.officeName}
            onChange={handleChange}
            placeholder="Офис в Симферополе"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HTML карты (iframe)
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            name="mapIframe"
            value={formData.mapIframe}
            onChange={handleChange}
            rows={3}
            placeholder="<iframe src='...'></iframe>"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Порядок сортировки
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300 text-[#00205B] focus:ring-[#00205B]"
              />
              Активен
            </label>
          </div>
        </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-end gap-3">
          <button
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            onClick={() => router.push('/admin/regions')}
          >
            Отмена
          </button>
          <button
            className="px-6 py-2.5 bg-[#00205B] text-white rounded-lg hover:bg-[#001a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            onClick={submit}
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить регион'}
          </button>
        </div>
      </div>
    </div>
  );
}

