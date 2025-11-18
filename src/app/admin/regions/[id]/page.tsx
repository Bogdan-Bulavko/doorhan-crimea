'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditRegionPage() {
  const router = useRouter();
  const params = useParams();
  const regionId = useMemo(() => {
    const raw = params?.id;
    return typeof raw === 'string' ? Number(raw) : Number(Array.isArray(raw) ? raw[0] : NaN);
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/regions/${regionId}`);
        const j = await res.json();
        if (j.success && j.data) {
          const r = j.data;
          setFormData({
            code: r.code || '',
            name: r.name || '',
            phone: r.phone || '',
            phoneFormatted: r.phoneFormatted || '',
            email: r.email || '',
            address: r.address || '',
            addressDescription: r.addressDescription || '',
            workingHours: r.workingHours || '',
            workingHoursDescription: r.workingHoursDescription || '',
            mapIframe: r.mapIframe || '',
            officeName: r.officeName || '',
            isActive: Boolean(r.isActive),
            sortOrder: r.sortOrder || 0,
          });
        } else {
          setError('Регион не найден');
        }
      } catch {
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(regionId)) load();
  }, [regionId]);

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

  const save = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const body = {
        ...formData,
        addressDescription: formData.addressDescription || undefined,
        workingHoursDescription: formData.workingHoursDescription || undefined,
        mapIframe: formData.mapIframe || undefined,
        officeName: formData.officeName || undefined,
      };

      const res = await fetch(`/api/admin/regions/${regionId}`, {
        method: 'PUT',
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
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00205B] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных региона...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.code) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="text-red-600">
          <h2 className="text-lg font-semibold mb-2">Ошибка загрузки</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Редактировать регион
        </h1>
        <p className="text-gray-600 mt-1">
          Изменение данных регионального офиса
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
            />
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
            onClick={save}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  );
}

