import { useState, useEffect } from 'react';

export interface MenuItem {
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

export interface Menu {
  id: number;
  name: string;
  description: string | null;
  items: MenuItem[];
}

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/menus', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Не кэшируем на клиенте, используем серверный кэш
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setMenus(result.data || []);
        } else {
          setError(result.message || 'Ошибка при загрузке меню');
        }
      } catch (err) {
        console.error('Error loading menus:', err);
        setError('Ошибка при загрузке меню');
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const getMenuByName = (name: string): Menu | undefined => {
    return menus.find(menu => menu.name === name);
  };

  return { menus, loading, error, getMenuByName };
}

