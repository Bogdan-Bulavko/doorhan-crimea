'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: number;
    name: string;
    slug: string;
    childrenCount: number;
    productsCount: number;
  } | null;
  onDelete: (id: number) => Promise<void>;
}

const DeleteCategoryModal = ({
  isOpen,
  onClose,
  category,
  onDelete,
}: DeleteCategoryModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!category) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onDelete(category.id);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при удалении категории'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  if (!category) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-[#00205B] font-montserrat">
                  Удалить категорию
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Warning */}
              <div className="flex items-start space-x-3 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Внимание!</p>
                  <p>
                    Это действие нельзя отменить. Категория будет удалена
                    навсегда.
                  </p>
                </div>
              </div>

              {/* Category Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Информация о категории:
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Название:</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slug:</span>
                    <span className="font-mono text-sm">{category.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дочерние категории:</span>
                    <span className="font-medium">
                      {category.childrenCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Товары:</span>
                    <span className="font-medium">
                      {category.productsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Удаляем...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Удалить</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteCategoryModal;
