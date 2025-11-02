'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface Region {
  name: string;
  subdomain: string;
}

interface RegionSelectorProps {
  variant?: 'header' | 'footer';
}

const RegionSelector = ({ variant = 'footer' }: RegionSelectorProps) => {
  const [currentRegion, setCurrentRegion] = useState('localhost');
  const [currentPath, setCurrentPath] = useState('/');

  const regions: Region[] = [
    { name: 'Крым', subdomain: 'localhost' },
    { name: 'Симферополь', subdomain: 'simferopol.localhost' },
    { name: 'Ялта', subdomain: 'yalta.localhost' },
    { name: 'Алушта', subdomain: 'alushta.localhost' },
    { name: 'Севастополь', subdomain: 'sevastopol.localhost' },
  ];

  useEffect(() => {
    setCurrentRegion(window.location.hostname);
    setCurrentPath(window.location.pathname);
  }, []);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubdomain = e.target.value;
    window.location.href = `http://${selectedSubdomain}:3000${currentPath}`;
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
          className="w-full lg:w-auto pl-10 lg:pl-9 pr-8 lg:pr-8 py-3 lg:py-1.5 rounded-lg text-sm lg:text-xs bg-white/10 text-gray-200 lg:text-gray-200 border border-white/20 hover:border-[#F6A800]/70 focus:border-[#F6A800] focus:outline-none transition-all duration-300 cursor-pointer appearance-none focus:bg-white/15 hover:bg-white/15 font-medium lg:min-w-[120px] touch-manipulation min-h-[44px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23F6A800' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '14px 14px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {regions.map((region) => (
            <option
              key={region.subdomain}
              value={region.subdomain}
              className="bg-[#00153E] text-white"
            >
              {region.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 font-montserrat text-gray-300">
        Выберите город
      </h4>
      <div className="relative w-full">
        <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
          <MapPin size={16} className="sm:w-4 sm:h-4 text-[#F6A800]" />
        </div>
        <select
          value={currentRegion}
          onChange={handleRegionChange}
          className="w-full pl-10 sm:pl-11 pr-9 sm:pr-10 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base bg-white/10 text-gray-300 border border-white/20 hover:border-[#F6A800]/70 focus:border-[#F6A800] focus:outline-none transition-all duration-300 cursor-pointer appearance-none focus:bg-white/15 hover:bg-white/15 font-medium touch-manipulation min-h-[44px] sm:min-h-[48px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23F6A800' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '16px 16px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {regions.map((region) => (
            <option
              key={region.subdomain}
              value={region.subdomain}
              className="bg-[#00153E] text-white py-2 text-sm sm:text-base"
            >
              {region.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RegionSelector;
