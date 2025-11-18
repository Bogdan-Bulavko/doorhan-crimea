'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Search, Plus } from 'lucide-react';
import DeleteModal from '../_components/DeleteModal';

interface Region {
  id: number;
  code: string;
  name: string;
  phone: string;
  phoneFormatted: string;
  email: string;
  address: string;
  addressDescription?: string | null;
  workingHours: string;
  workingHoursDescription?: string | null;
  mapIframe?: string | null;
  officeName?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RegionsListProps {
  initialRegions: Region[];
}

export default function RegionsList({ initialRegions }: RegionsListProps) {
  const [regions, setRegions] = useState(initialRegions);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    region: Region | null;
  }>({ isOpen: false, region: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Фильтрация регионов по поисковому запросу
  const filteredRegions = useMemo(() => {
    if (!searchTerm.trim()) {
      return regions;
    }

    const searchLower = searchTerm.toLowerCase();
    return regions.filter(
      (region) =>
        region.name.toLowerCase().includes(searchLower) ||
        region.code.toLowerCase().includes(searchLower) ||
        region.address.toLowerCase().includes(searchLower) ||
        region.phone.toLowerCase().includes(searchLower)
    );
  }, [regions, searchTerm]);

  const handleDeleteClick = (region: Region) => {
    setDeleteModal({ isOpen: true, region });
  };

  const handleDeleteConfirm = async (regionId: number) => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/regions/${regionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Обновляем список регионов
        setRegions((prev) => prev.filter((r) => r.id !== regionId));
        setDeleteModal({ isOpen: false, region: null });

        // Показываем уведомление об успехе
        alert('Регион успешно удален');
      } else {
        throw new Error(result.message || 'Ошибка при удалении региона');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(
        error instanceof Error ? error.message : 'Ошибка при удалении региона'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, region: null });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Заголовок и кнопка добавления */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Регионы</h1>
            <p className="text-gray-600 mt-1">
              Управление региональными офисами и контактами
            </p>
          </div>
          <Link
            href="/admin/regions/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00205B] text-white rounded-lg hover:bg-[#001a4a] transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Добавить регион
          </Link>
        </div>

        {/* Панель управления */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск по названию, коду, адресу или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            />
          </div>

          {/* Статистика */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <span>Всего регионов: {regions.length}</span>
            {searchTerm && (
              <span className="text-[#00205B]">
                Найдено: {filteredRegions.length}
              </span>
            )}
          </div>
        </div>

        {/* Таблица регионов */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-700 border-b">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Код</th>
                <th className="p-4 font-semibold">Название</th>
                <th className="p-4 font-semibold">Телефон</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Адрес</th>
                <th className="p-4 font-semibold">Активен</th>
                <th className="p-4 font-semibold">Порядок</th>
                <th className="p-4 font-semibold text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 mb-2">
                        <Search className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        {searchTerm ? 'Регионы не найдены' : 'Нет регионов'}
                      </p>
                      {!searchTerm && (
                        <Link
                          href="/admin/regions/new"
                          className="mt-4 text-[#00205B] hover:underline"
                        >
                          Добавить первый регион
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegions.map((region) => (
                  <tr
                    key={region.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs text-gray-500">{region.id}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {region.code}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900">{region.name}</td>
                    <td className="p-4 text-gray-700">{region.phoneFormatted}</td>
                    <td className="p-4 text-gray-600">{region.email}</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={region.address}>
                      {region.address}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          region.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {region.isActive ? 'Да' : 'Нет'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{region.sortOrder}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/admin/regions/${region.id}`}
                          className="p-2 text-[#00205B] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(region)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={region.code === 'default' ? 'Нельзя удалить регион по умолчанию' : 'Удалить'}
                          disabled={isDeleting || region.code === 'default'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={async () => {
          if (deleteModal.region) {
            await handleDeleteConfirm(deleteModal.region.id);
          }
        }}
        title="Удалить регион?"
        message={`Вы уверены, что хотите удалить регион "${deleteModal.region?.name}"? Это действие нельзя отменить.`}
        itemName={deleteModal.region?.name || ''}
      />
    </>
  );
}

