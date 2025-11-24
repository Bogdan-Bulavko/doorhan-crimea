'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useAlert();
  const menuId = useMemo(() => {
    const raw = params?.id;
    if (raw === 'new') return null;
    return typeof raw === 'string' ? Number(raw) : Number(Array.isArray(raw) ? raw[0] : NaN);
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (menuId) {
      loadMenu();
    } else {
      setLoading(false);
    }
  }, [menuId]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/menus/${menuId}`);
      const result = await response.json();

      if (result.success && result.data) {
        setName(result.data.name);
        setDescription(result.data.description || '');
      } else {
        showAlert({ type: 'error', title: 'Меню не найдено' });
        router.push('/admin/menus');
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      showAlert({ type: 'error', title: 'Ошибка при загрузке меню' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert({ type: 'error', title: 'Название меню обязательно' });
      return;
    }

    setSaving(true);
    try {
      const url = menuId ? `/api/admin/menus/${menuId}` : '/api/admin/menus';
      const method = menuId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showAlert({ type: 'success', title: menuId ? 'Меню обновлено' : 'Меню создано' });
        const savedMenuId = result.data.id || menuId;
        router.push(`/admin/menus/${savedMenuId}`);
      } else {
        showAlert({ type: 'error', title: result.message || 'Ошибка при сохранении' });
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      showAlert({ type: 'error', title: 'Ошибка при сохранении меню' });
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

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#00205B]">
          {menuId ? 'Редактировать меню' : 'Создать меню'}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/admin/menus')}
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
            Название меню <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            placeholder="header или footer"
            disabled={menuId !== null && (name === 'header' || name === 'footer')}
          />
          <p className="text-xs text-gray-500 mt-1">
            Системные меню: header, footer (нельзя изменить название)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            placeholder="Описание меню (опционально)"
          />
        </div>
      </div>

      {menuId && (
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#00205B]">Пункты меню</h2>
            <button
              onClick={() => router.push(`/admin/menus/${menuId}/items/new`)}
              className="px-4 py-2 bg-[#F6A800] text-white rounded-lg hover:bg-[#ffb700] transition-colors"
            >
              Добавить пункт
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Перейдите к редактированию пунктов меню после сохранения
          </p>
        </div>
      )}
    </div>
  );
}

