'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useRegion } from '@/contexts/RegionContext';

interface Region {
  code: string;
  name: string;
  isActive: boolean;
}

interface RegionSelectorProps {
  variant?: 'header' | 'footer';
}

const RegionSelector = ({ variant = 'footer' }: RegionSelectorProps) => {
  const { currentRegion, setRegion } = useRegion();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const response = await fetch('/api/regions', {
        cache: 'no-store',
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        // API уже возвращает только активные регионы, но на всякий случай фильтруем
        const activeRegions = result.data.filter((r: Region) => r.isActive !== false);
        setRegions(activeRegions);
      } else {
        console.error('API вернул ошибку:', result);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedRegion = regions.find(r => r.code === selectedCode);
    
    if (selectedRegion) {
      // Обновляем контекст
      setRegion(selectedCode);
      
      // Если это не localhost, перенаправляем на поддомен
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname.includes('localhost');
        
        if (isLocalhost && selectedCode !== 'default') {
          // В development режиме перенаправляем на поддомен
          window.location.href = `http://${selectedCode}.localhost:3000${currentPath}`;
        } else if (!isLocalhost && selectedCode !== 'default') {
          // В production перенаправляем на поддомен
          const domain = hostname.split('.').slice(-2).join('.');
          window.location.href = `https://${selectedCode}.${domain}${currentPath}`;
        }
        // Если выбран default, остаемся на текущем домене
      }
    }
  };

  if (variant === 'header') {
    return (
      <div className="relative group w-full lg:w-auto">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
          <MapPin size={16} className="text-[#F6A800]" />
        </div>
        <select
          value={currentRegion}
          onChange={handleRegionChange}
          disabled={loading}
          className="w-full lg:w-auto pl-10 lg:pl-9 pr-8 lg:pr-8 py-3 lg:py-1.5 rounded-lg text-sm lg:text-xs bg-white/10 text-gray-200 lg:text-gray-200 border border-white/20 hover:border-[#F6A800]/70 focus:border-[#F6A800] focus:outline-none transition-all duration-300 cursor-pointer appearance-none focus:bg-white/15 hover:bg-white/15 font-medium lg:min-w-[120px] touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23F6A800' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '14px 14px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {loading ? (
            <option value={currentRegion}>Загрузка...</option>
          ) : (
            regions.map((region) => (
              <option
                key={region.code}
                value={region.code}
                className="bg-[#00153E] text-white"
              >
                {region.name}
              </option>
            ))
          )}
        </select>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 font-montserrat text-white text-center">
        Выберите город
      </h4>
      <div className="relative w-full">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
          <MapPin size={18} className="text-[#F6A800]" />
        </div>
        <select
          value={currentRegion}
          onChange={handleRegionChange}
          disabled={loading}
          className="w-full pl-12 pr-10 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 hover:border-[#F6A800]/70 focus:border-[#F6A800] focus:outline-none focus:ring-2 focus:ring-[#F6A800]/30 transition-all duration-300 cursor-pointer appearance-none focus:bg-white/15 hover:bg-white/15 font-medium touch-manipulation min-h-[48px] sm:min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpath fill='%23F6A800' d='M9 12.5L3.5 7h11z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '18px 18px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {loading ? (
            <option value={currentRegion}>Загрузка...</option>
          ) : (
            regions.map((region) => (
              <option
                key={region.code}
                value={region.code}
                className="bg-[#00153E] text-white py-2 text-sm sm:text-base"
              >
                {region.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export default RegionSelector;
