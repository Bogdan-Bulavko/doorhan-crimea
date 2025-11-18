'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Search, Plus } from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PagesListProps {
  initialPages: Page[];
}

export default function PagesList({ initialPages }: PagesListProps) {
  const [pages, setPages] = useState(initialPages);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    page: Page | null;
  }>({ isOpen: false, page: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Фильтрация страниц по поисковому запросу
  const filteredPages = useMemo(() => {
    if (!searchTerm.trim()) {
      return pages;
    }

    const searchLower = searchTerm.toLowerCase();
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(searchLower) ||
        page.slug.toLowerCase().includes(searchLower) ||
        (page.content && page.content.toLowerCase().includes(searchLower))
    );
  }, [pages, searchTerm]);

  const handleDeleteClick = (page: Page) => {
    setDeleteModal({ isOpen: true, page });
  };

  const handleDeleteConfirm = async (pageId: number) => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Обновляем список страниц
        setPages((prev) => prev.filter((p) => p.id !== pageId));
        setDeleteModal({ isOpen: false, page: null });

        // Показываем уведомление об успехе
        alert('Страница успешно удалена');
      } else {
        throw new Error(result.message || 'Ошибка при удалении страницы');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(
        error instanceof Error ? error.message : 'Ошибка при удалении страницы'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, page: null });
    }
  };

  return (
    <>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#00205B]">Страницы</h1>
          <Link
            href="/admin/pages/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00205B] text-white text-sm hover:bg-[#00153E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить страницу
          </Link>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Поиск по названию, slug или содержимому..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
          />
        </div>

        {filteredPages.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
            {searchTerm ? 'Страницы не найдены' : 'Нет страниц. Создайте первую страницу.'}
          </div>
        ) : (
          <div className="rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="p-3">ID</th>
                  <th className="p-3">Название</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Активна</th>
                  <th className="p-3">Порядок</th>
                  <th className="p-3">Обновлена</th>
                  <th className="p-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => (
                  <tr
                    key={page.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-3 font-mono text-xs">{page.id}</td>
                    <td className="p-3 font-medium">{page.title}</td>
                    <td className="p-3 font-mono text-xs text-gray-600">
                      {page.slug}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          page.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {page.isActive ? 'Да' : 'Нет'}
                      </span>
                    </td>
                    <td className="p-3">{page.sortOrder}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(page.updatedAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="p-2 text-[#00205B] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(page)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.page && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Удалить страницу?
            </h3>
            <p className="text-gray-600 mb-4">
              Вы уверены, что хотите удалить страницу{' '}
              <strong>{deleteModal.page.title}</strong>? Это действие нельзя
              отменить.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteModal.page!.id)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

