'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminRoutes = [
  { href: '/admin', label: 'Главная', icon: '🏠' },
  { href: '/admin/products', label: 'Товары', icon: '📦' },
  { href: '/admin/categories', label: 'Категории', icon: '📂' },
  { href: '/admin/orders', label: 'Заказы', icon: '📋' },
  { href: '/admin/users', label: 'Пользователи', icon: '👥' },
  { href: '/admin/stats', label: 'Статистика', icon: '📊' },
  { href: '/admin/forms', label: 'Формы', icon: '📝' },
];

export function Preloader() {
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    // Preload adjacent routes
    const currentIndex = adminRoutes.findIndex(route => route.href === pathname);
    const routesToPreload = [
      adminRoutes[currentIndex - 1],
      adminRoutes[currentIndex + 1]
    ].filter(Boolean);

    routesToPreload.forEach(route => {
      if (!preloadedRoutes.has(route.href)) {
        // Preload the route
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route.href;
        document.head.appendChild(link);
        
        setPreloadedRoutes(prev => new Set([...prev, route.href]));
      }
    });
  }, [pathname, preloadedRoutes]);

  return (
    <div className="hidden">
      {adminRoutes.map(route => (
        <Link key={route.href} href={route.href} prefetch={true}>
          {route.label}
        </Link>
      ))}
    </div>
  );
}

export function RoutePreloader() {
  const [isPreloading, setIsPreloading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleRouteChange = () => {
      setIsPreloading(true);
      // Simulate preloading time
      setTimeout(() => setIsPreloading(false), 200);
    };

    handleRouteChange();
  }, [pathname]);

  if (!isPreloading) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg flex items-center space-x-3">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-[#00205B] rounded-full" />
        <span className="text-gray-600">Загрузка...</span>
      </div>
    </div>
  );
}
