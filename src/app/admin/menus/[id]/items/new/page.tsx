'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';

export default function NewMenuItemPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useAlert();
  const menuId = useMemo(() => {
    const raw = params?.id;
    return typeof raw === 'string' ? Number(raw) : Number(Array.isArray(raw) ? raw[0] : NaN);
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  interface MenuItemData {
    id: number;
    title: string;
    href: string;
    parentId: number | null;
    isActive: boolean;
    sortOrder: number;
    target: string;
    icon: string | null;
  }
  
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [title, setTitle] = useState('');
  const [href, setHref] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [target, setTarget] = useState('_self');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (menuId) {
      loadMenuItems();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/menus/${menuId}/items`);
      const result = await response.json();

      if (result.success) {
        setMenuItems(result.data);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !href.trim()) {
      showAlert({ type: 'error', title: 'Название и URL обязательны' });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/menus/${menuId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          href,
          parentId: parentId || null,
          isActive,
          sortOrder: Number(sortOrder) || 0,
          target,
          icon: icon || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showAlert({ type: 'success', title: 'Пункт меню создан' });
        router.push(`/admin/menus/${menuId}`);
      } else {
        showAlert({ type: 'error', title: result.message || 'Ошибка при сохранении' });
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      showAlert({ type: 'error', title: 'Ошибка при сохранении пункта меню' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00205B]"></div>
      </div>
    );
  }

  const rootItems = menuItems.filter(item => !item.parentId);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#00205B]">Добавить пункт меню</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/menus/${menuId}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#00153E] transition-colors disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            placeholder="Главная"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            placeholder="/ или /categories или /#about"
          />
          <p className="text-xs text-gray-500 mt-1">
            Можно использовать якоря: /#about, /#contacts
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Родительский пункт
          </label>
          <select
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
          >
            <option value="">Нет (корневой пункт)</option>
            {rootItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Выберите родительский пункт для создания вложенного меню
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Порядок сортировки
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            >
              <option value="_self">Текущее окно</option>
              <option value="_blank">Новое окно</option>
              <option value="_parent">Родительское окно</option>
              <option value="_top">Верхнее окно</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Иконка (опционально)
          </label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            placeholder="Название иконки из lucide-react"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-[#00205B] border-gray-300 rounded focus:ring-[#00205B]"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Активен
          </label>
        </div>
      </div>
    </div>
  );
}

