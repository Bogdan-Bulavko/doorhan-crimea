'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

interface RegionalData {
  id?: number;
  regionCode: string;
  description: string | null;
  h1: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  schemaMarkup: string | null;
  contentTop: string | null;
  contentBottom: string | null;
}

interface CategoryRegionalDataEditorProps {
  categoryId: number;
  onClose?: () => void;
}

const REGIONS = [
  { code: 'default', name: 'Основной домен (zavod-doorhan.ru)' },
  { code: 'simferopol', name: 'Симферополь' },
  { code: 'kerch', name: 'Керчь' },
  { code: 'evpatoria', name: 'Евпатория' },
  { code: 'yalta', name: 'Ялта' },
  { code: 'feodosia', name: 'Феодосия' },
  { code: 'sevastopol', name: 'Севастополь' },
  { code: 'alushta', name: 'Алушта' },
  { code: 'dzhankoy', name: 'Джанкой' },
  { code: 'bakhchisaray', name: 'Бахчисарай' },
  { code: 'krasnoperekopsk', name: 'Красноперекопск' },
  { code: 'saki', name: 'Саки' },
  { code: 'armyansk', name: 'Армянск' },
  { code: 'sudak', name: 'Судак' },
  { code: 'belogorsk', name: 'Белогорск' },
  { code: 'inkerman', name: 'Инкерман' },
  { code: 'balaklava', name: 'Балаклава' },
  { code: 'shchelkino', name: 'Щёлкино' },
  { code: 'stary-krym', name: 'Старый Крым' },
  { code: 'alupka', name: 'Алупка' },
  { code: 'gurzuf', name: 'Гурзуф' },
  { code: 'simeiz', name: 'Симеиз' },
  { code: 'foros', name: 'Форос' },
  { code: 'koktebel', name: 'Коктебель' },
  { code: 'livadia', name: 'Ливадия' },
  { code: 'massandra', name: 'Массандра' },
  { code: 'nikita', name: 'Никита' },
  { code: 'gaspra', name: 'Гаспра' },
  { code: 'miskhor', name: 'Мисхор' },
  { code: 'partenit', name: 'Партенит' },
  { code: 'kacha', name: 'Кача' },
];

export default function CategoryRegionalDataEditor({ categoryId, onClose }: CategoryRegionalDataEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionalData, setRegionalData] = useState<Record<string, RegionalData>>({});
  const [currentData, setCurrentData] = useState<RegionalData>({
    regionCode: 'default',
    description: null,
    h1: null,
    seoTitle: null,
    seoDescription: null,
    schemaMarkup: null,
    contentTop: null,
    contentBottom: null,
  });

  // Загружаем региональные данные
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/categories/${categoryId}/regional`);
        const j = await res.json();
        if (j.success && j.data) {
          const dataMap: Record<string, RegionalData> = {};
          j.data.forEach((item: RegionalData) => {
            dataMap[item.regionCode] = item;
          });
          setRegionalData(dataMap);
        }
      } catch (error) {
        console.error('Ошибка загрузки региональных данных:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId]);

  // Загружаем данные выбранного региона
  useEffect(() => {
    if (selectedRegion) {
      const data = regionalData[selectedRegion] || {
        regionCode: selectedRegion,
        description: null,
        h1: null,
        seoTitle: null,
        seoDescription: null,
        schemaMarkup: null,
        contentTop: null,
        contentBottom: null,
      };
      setCurrentData(data);
    }
  }, [selectedRegion, regionalData]);

  const handleSave = async () => {
    if (!selectedRegion) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/categories/${categoryId}/regional`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData),
      });
      const j = await res.json();
      if (j.success) {
        // Обновляем локальное состояние
        setRegionalData(prev => ({
          ...prev,
          [selectedRegion]: j.data,
        }));
        alert('Региональные данные сохранены!');
      } else {
        alert(`Ошибка: ${j.message}`);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка сохранения региональных данных');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRegion || !confirm('Удалить региональные данные для этого региона?')) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/categories/${categoryId}/regional?regionCode=${selectedRegion}`, {
        method: 'DELETE',
      });
      const j = await res.json();
      if (j.success) {
        // Удаляем из локального состояния
        const newData = { ...regionalData };
        delete newData[selectedRegion];
        setRegionalData(newData);
        setSelectedRegion(null);
        alert('Региональные данные удалены!');
      } else {
        alert(`Ошибка: ${j.message}`);
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления региональных данных');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Загрузка региональных данных...</div>;
  }

  return (
    <div className="border rounded-xl bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#00205B]">Региональная уникализация категории</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Выберите регион для настройки уникального контента. Если поля не заполнены, будут использоваться базовые данные категории или автогенерация.
      </p>

      {/* Выбор региона */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Выберите регион:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {REGIONS.map(region => {
            const hasData = !!regionalData[region.code];
            return (
              <button
                key={region.code}
                onClick={() => setSelectedRegion(region.code)}
                className={`p-2 text-sm border rounded-lg transition-colors ${
                  selectedRegion === region.code
                    ? 'bg-[#00205B] text-white border-[#00205B]'
                    : hasData
                    ? 'bg-green-50 border-green-300 hover:bg-green-100'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {region.name}
                {hasData && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Форма редактирования */}
      {selectedRegion && (
        <div className="border-t pt-4 mt-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#00205B]">
              Данные для региона: {REGIONS.find(r => r.code === selectedRegion)?.name}
            </h4>
            <div className="flex gap-2">
              {regionalData[selectedRegion] && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  Удалить
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 text-sm bg-[#00205B] text-white rounded hover:bg-[#00153E] disabled:opacity-50"
              >
                <Save size={16} className="inline mr-1" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={currentData.description || ''}
                onChange={(e) => setCurrentData({ ...currentData, description: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="Описание категории для этого региона"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                H1 Заголовок
              </label>
              <input
                type="text"
                value={currentData.h1 || ''}
                onChange={(e) => setCurrentData({ ...currentData, h1: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="H1 заголовок для этого региона"
              />
              <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [category_name] и др.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={currentData.seoTitle || ''}
                  onChange={(e) => setCurrentData({ ...currentData, seoTitle: e.target.value || null })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Метатег title для этого региона"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  value={currentData.seoDescription || ''}
                  onChange={(e) => setCurrentData({ ...currentData, seoDescription: e.target.value || null })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Метатег description для этого региона"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schema Markup (JSON-LD)
              </label>
              <textarea
                value={currentData.schemaMarkup || ''}
                onChange={(e) => setCurrentData({ ...currentData, schemaMarkup: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                rows={6}
                placeholder='{"@context": "https://schema.org", "@type": "Product", ...}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Контент сверху страницы (HTML)
              </label>
              <textarea
                value={currentData.contentTop || ''}
                onChange={(e) => setCurrentData({ ...currentData, contentTop: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                rows={6}
                placeholder="<p>HTML контент для отображения вверху страницы</p>"
              />
              <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [category_name] и др.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Контент снизу страницы (HTML)
              </label>
              <textarea
                value={currentData.contentBottom || ''}
                onChange={(e) => setCurrentData({ ...currentData, contentBottom: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                rows={6}
                placeholder="<p>HTML контент для отображения внизу страницы</p>"
              />
              <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [category_name] и др.</p>
            </div>
          </div>
        </div>
      )}

      {!selectedRegion && (
        <div className="text-center py-8 text-gray-500">
          Выберите регион для редактирования региональных данных
        </div>
      )}
    </div>
  );
}
