'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';

interface MenuItem {
  id: number;
  title: string;
  href: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  target: string;
  icon: string | null;
  children?: MenuItem[];
}

interface Menu {
  id: number;
  name: string;
  description: string | null;
  items: MenuItem[];
}

export default function MenusPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/menus');
      const result = await response.json();
      
      if (result.success) {
        setMenus(result.data);
        // Автоматически раскрываем все меню
        setExpandedMenus(new Set(result.data.map((m: Menu) => m.id)));
      } else {
        showAlert({ type: 'error', title: 'Ошибка при загрузке меню' });
      }
    } catch (error) {
      console.error('Error loading menus:', error);
      showAlert({ type: 'error', title: 'Ошибка при загрузке меню' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (menuId: number) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const handleDelete = async (menuId: number, menuName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить меню "${menuName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showAlert({ type: 'success', title: 'Меню успешно удалено' });
        loadMenus();
      } else {
        showAlert({ type: 'error', title: result.message || 'Ошибка при удалении меню' });
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      showAlert({ type: 'error', title: 'Ошибка при удалении меню' });
    }
  };

  const renderMenuItem = (item: MenuItem, menuId: number, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const indent = level * 24;

    return (
      <div key={item.id} className="border-l-2 border-gray-200 ml-4">
        <div
          className="flex items-center justify-between p-3 bg-white rounded-lg mb-2 hover:bg-gray-50 transition-colors"
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-900">{item.title}</span>
              <span className="text-xs text-gray-500">({item.href})</span>
              {!item.isActive && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Неактивно</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/admin/menus/${menuId}/items/${item.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Редактировать"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={async () => {
                if (!confirm(`Удалить пункт меню "${item.title}"?`)) return;
                try {
                  const response = await fetch(`/api/admin/menus/${menuId}/items/${item.id}`, {
                    method: 'DELETE',
                  });
                  const result = await response.json();
                  if (result.success) {
                    showAlert({ type: 'success', title: 'Пункт меню удален' });
                    loadMenus();
                  } else {
                    showAlert({ type: 'error', title: result.message || 'Ошибка при удалении' });
                  }
                } catch (error) {
                  console.error('Error deleting menu item:', error);
                  showAlert({ type: 'error', title: 'Ошибка при удалении пункта меню' });
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {hasChildren && item.children!.map(child => renderMenuItem(child, menuId, level + 1))}
      </div>
    );
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
        <h1 className="text-2xl font-bold text-[#00205B]">Управление меню</h1>
        <button
          onClick={() => router.push('/admin/menus/new')}
          className="px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#00153E] transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Создать меню</span>
        </button>
      </div>

      <div className="grid gap-4">
        {menus.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-gray-500 mb-4">Меню не найдены</p>
            <button
              onClick={() => router.push('/admin/menus/new')}
              className="px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#00153E] transition-colors"
            >
              Создать первое меню
            </button>
          </div>
        ) : (
          menus.map((menu) => (
            <div key={menu.id} className="rounded-xl border bg-white overflow-hidden">
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleMenu(menu.id)}
              >
                <div className="flex items-center space-x-3">
                  {expandedMenus.has(menu.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-[#00205B]">{menu.name}</h3>
                    {menu.description && (
                      <p className="text-sm text-gray-500">{menu.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Пунктов меню: {menu.items.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/menus/${menu.id}`);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {menu.name !== 'header' && menu.name !== 'footer' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(menu.id, menu.name);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {expandedMenus.has(menu.id) && (
                <div className="p-4 border-t border-gray-200">
                  {menu.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-4">Пункты меню отсутствуют</p>
                      <button
                        onClick={() => router.push(`/admin/menus/${menu.id}/items/new`)}
                        className="px-4 py-2 bg-[#F6A800] text-white rounded-lg hover:bg-[#ffb700] transition-colors"
                      >
                        Добавить пункт меню
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => router.push(`/admin/menus/${menu.id}/items/new`)}
                          className="px-4 py-2 bg-[#F6A800] text-white rounded-lg hover:bg-[#ffb700] transition-colors flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Добавить пункт</span>
                        </button>
                      </div>
                      {menu.items.map((item) => renderMenuItem(item, menu.id))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

