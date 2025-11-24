'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Search, Plus } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  author: string | null;
  tags: string | null;
  isActive: boolean;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ArticlesListProps {
  initialArticles: Article[];
}

export default function ArticlesList({ initialArticles }: ArticlesListProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    article: Article | null;
  }>({ isOpen: false, article: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Фильтрация статей по поисковому запросу
  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) {
      return articles;
    }

    const searchLower = searchTerm.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchLower) ||
        article.slug.toLowerCase().includes(searchLower) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchLower)) ||
        (article.content && article.content.toLowerCase().includes(searchLower))
    );
  }, [articles, searchTerm]);

  const handleDeleteClick = (article: Article) => {
    setDeleteModal({ isOpen: true, article });
  };

  const handleDeleteConfirm = async (articleId: number) => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Обновляем список статей
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
        setDeleteModal({ isOpen: false, article: null });

        // Показываем уведомление об успехе
        alert('Статья успешно удалена');
      } else {
        throw new Error(result.message || 'Ошибка при удалении статьи');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(
        error instanceof Error ? error.message : 'Ошибка при удалении статьи'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, article: null });
    }
  };

  return (
    <>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#00205B]">Статьи</h1>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00205B] text-white text-sm hover:bg-[#00153E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить статью
          </Link>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Поиск по названию, slug, описанию или содержимому..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
          />
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
            {searchTerm ? 'Статьи не найдены' : 'Нет статей. Создайте первую статью.'}
          </div>
        ) : (
          <div className="rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="p-3">ID</th>
                  <th className="p-3">Название</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Автор</th>
                  <th className="p-3">Активна</th>
                  <th className="p-3">Публикация</th>
                  <th className="p-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-3 font-mono text-xs">{article.id}</td>
                    <td className="p-3 font-medium">{article.title}</td>
                    <td className="p-3 font-mono text-xs text-gray-600">
                      {article.slug}
                    </td>
                    <td className="p-3 text-gray-600">
                      {article.author || '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          article.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {article.isActive ? 'Да' : 'Нет'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('ru-RU')
                        : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="p-2 text-[#00205B] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(article)}
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
      {deleteModal.isOpen && deleteModal.article && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Удалить статью?
            </h3>
            <p className="text-gray-600 mb-4">
              Вы уверены, что хотите удалить статью{' '}
              <strong>{deleteModal.article.title}</strong>? Это действие нельзя
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
                onClick={() => handleDeleteConfirm(deleteModal.article!.id)}
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

