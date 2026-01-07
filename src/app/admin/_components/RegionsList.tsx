'use client';

import { useEffect, useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface Region {
  id: number;
  code: string;
  name: string;
  phone: string;
  phoneFormatted: string;
  email: string;
  address: string;
  isActive: boolean;
}

interface RegionsListProps {
  defaultCollapsed?: boolean;
}

export default function RegionsList({ defaultCollapsed = true }: RegionsListProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await fetch('/api/admin/regions');
        const j = await res.json();
        if (j.success && j.data) {
          setRegions(j.data.filter((r: Region) => r.isActive));
        }
      } catch (error) {
        console.error('Ошибка загрузки регионов:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRegions();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">Загрузка регионов...</p>
      </div>
    );
  }

  if (regions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">Регионы не найдены</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Активные регионы</h3>
          <span className="text-xs text-blue-600">({regions.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-blue-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-blue-600" />
        )}
      </button>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {regions.map((region) => (
              <div
                key={region.id}
                className="bg-white rounded-lg p-3 border border-blue-100"
              >
                <div className="font-medium text-gray-900 mb-1">{region.name}</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📞 {region.phoneFormatted}</div>
                  <div>✉️ {region.email}</div>
                  <div>📍 {region.address}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Шорткоды автоматически подставляют данные текущего региона пользователя.
          </p>
        </>
      )}
    </div>
  );
}

