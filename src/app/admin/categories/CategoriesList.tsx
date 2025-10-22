'use client';

import { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation'; // Пока не используется
import Link from 'next/link';
import { Trash2, Edit, Search } from 'lucide-react';
import DeleteCategoryModal from '../_components/DeleteCategoryModal';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  isActive: boolean;
  children: Category[];
  products: {
    id: number;
    name: string;
    slug: string;
    price: string;
    oldPrice: string | null;
    currency: string;
    inStock: boolean;
    createdAt: Date;
  }[];
}

interface CategoriesListProps {
  initialCategories: Category[];
}

export default function CategoriesList({
  initialCategories,
}: CategoriesListProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);
  // const router = useRouter(); // Пока не используется

  // Фильтрация категорий по поисковому запросу
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories;
    }

    const searchLower = searchTerm.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchLower) ||
      category.slug.toLowerCase().includes(searchLower) ||
      category.products.some(product => 
        product.name.toLowerCase().includes(searchLower)
      )
    );
  }, [categories, searchTerm]);

  const handleDeleteClick = (category: Category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const handleDeleteConfirm = async (categoryId: number) => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Обновляем список категорий
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        setDeleteModal({ isOpen: false, category: null });

        // Показываем уведомление об успехе
        alert('Категория успешно удалена');
      } else {
        throw new Error(result.message || 'Ошибка при удалении категории');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(
        error instanceof Error ? error.message : 'Ошибка при удалении категории'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, category: null });
    }
  };

  return (
    <>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#00205B]">Категории</h1>
          <Link
            href="/admin/categories/new"
            className="px-4 py-2 rounded-lg bg-[#00205B] text-white text-sm hover:bg-[#00153E] transition-colors"
          >
            Добавить категорию
          </Link>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Поиск по названию, slug или товарам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
          />
        </div>

        <div className="rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-3">ID</th>
                <th className="p-3">Название</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Родитель</th>
                <th className="p-3">Активна</th>
                <th className="p-3">Дочерние</th>
                <th className="p-3">Товары</th>
                <th className="p-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="p-3 font-mono text-xs">{category.id}</td>
                  <td className="p-3 font-medium">{category.name}</td>
                  <td className="p-3 font-mono text-xs text-gray-600">
                    {category.slug}
                  </td>
                  <td className="p-3">{category.parentId ?? '—'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.isActive ? 'Да' : 'Нет'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {category.children.length}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      {category.products.length}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="p-2 text-[#00205B] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(category)}
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
      </div>

      {/* Delete Modal */}
      <DeleteCategoryModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        category={
          deleteModal.category
            ? {
                id: deleteModal.category.id,
                name: deleteModal.category.name,
                slug: deleteModal.category.slug,
                childrenCount: deleteModal.category.children.length,
                productsCount: deleteModal.category.products.length,
              }
            : null
        }
        onDelete={handleDeleteConfirm}
      />
    </>
  );
}
