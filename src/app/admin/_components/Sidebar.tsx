'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  BarChart3,
  MapPin,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Главная',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Товары',
    href: '/admin/products',
    icon: <Package className="w-5 h-5" />,
  },
  {
    label: 'Категории',
    href: '/admin/categories',
    icon: <FolderTree className="w-5 h-5" />,
  },
  {
    label: 'Заказы',
    href: '/admin/orders',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    label: 'Пользователи',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'Настройки',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
    children: [
      {
        label: 'Основные',
        href: '/admin/settings',
        icon: <Settings className="w-4 h-4" />,
      },
      {
        label: 'Регионы',
        href: '/admin/regions',
        icon: <MapPin className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Формы',
    href: '/admin/forms',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Статистика',
    href: '/admin/stats',
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    // Автоматически открываем меню, если текущий путь входит в него
    const activeMenu = menuItems.find(item => 
      item.children?.some(child => child.href === pathname) ||
      (item.href === pathname && item.children)
    );
    return activeMenu ? [activeMenu.label] : [];
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isParentActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return isActive(item.href);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/signin' });
  };

  return (
    <>
      {/* Мобильная кнопка меню */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-[110] lg:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      )}

      {/* Overlay для мобильных */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-[100] transition-transform duration-300 ${
          isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'
        } lg:translate-x-0`}
      >
      {/* Логотип */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-center px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00205B] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DH</span>
          </div>
          <span className="font-bold text-[#00205B] text-lg">DoorHan Admin</span>
        </Link>
      </div>

      {/* Меню */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus.includes(item.label);
            const active = isParentActive(item);

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                        active
                          ? 'bg-[#00205B] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={active ? 'text-white' : 'text-gray-500'}>
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {isOpen && (
                      <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                        {item.children!.map((child) => {
                          const childActive = isActive(child.href);
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                                  childActive
                                    ? 'bg-[#00205B] text-white font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <span className={childActive ? 'text-white' : 'text-gray-400'}>
                                  {child.icon}
                                </span>
                                <span>{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? 'bg-[#00205B] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={active ? 'text-white' : 'text-gray-500'}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Выход */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Выход</span>
        </button>
      </div>
      </div>
    </>
  );
}

