'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Specification {
  id?: number;
  name: string;
  value: string;
  unit?: string;
  sortOrder: number;
}

interface ProductSpecificationsProps {
  specifications: Specification[];
  onChange: (specifications: Specification[]) => void;
  disabled?: boolean;
}

export default function ProductSpecifications({
  specifications,
  onChange,
  disabled = false,
}: ProductSpecificationsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addSpecification = () => {
    const newSpec: Specification = {
      name: '',
      value: '',
      unit: '',
      sortOrder: specifications.length,
    };
    onChange([...specifications, newSpec]);
  };

  const updateSpecification = (index: number, field: keyof Specification, value: string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSpecification = (index: number) => {
    const updated = specifications.filter((_, i) => i !== index);
    // Обновляем sortOrder для оставшихся элементов
    const reordered = updated.map((spec, i) => ({ ...spec, sortOrder: i }));
    onChange(reordered);
  };

  const moveSpecification = (fromIndex: number, toIndex: number) => {
    const updated = [...specifications];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    
    // Обновляем sortOrder
    const reordered = updated.map((spec, i) => ({ ...spec, sortOrder: i }));
    onChange(reordered);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveSpecification(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#00205B]">Характеристики товара</h3>
        <button
          type="button"
          onClick={addSpecification}
          disabled={disabled}
          className="flex items-center space-x-2 px-4 py-2 bg-[#F6A800] hover:bg-[#ffb700] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          <span>Добавить характеристику</span>
        </button>
      </div>

      {specifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>Характеристики не добавлены</p>
          <p className="text-sm">Нажмите &quot;Добавить характеристику&quot; для создания</p>
        </div>
      ) : (
        <div className="space-y-3">
          {specifications.map((spec, index) => (
            <div
              key={index}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex items-center space-x-3 p-4 bg-white border rounded-lg hover:shadow-md transition-all ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${disabled ? 'opacity-60' : ''}`}
            >
              {/* Drag handle */}
              {!disabled && (
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical size={16} />
                </div>
              )}

              {/* Название характеристики */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  disabled={disabled}
                  placeholder="Например: Ширина проема"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F6A800] focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Значение */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Значение
                </label>
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  disabled={disabled}
                  placeholder="Например: 2000-3000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F6A800] focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Единица измерения */}
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Единица
                </label>
                <input
                  type="text"
                  value={spec.unit || ''}
                  onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                  disabled={disabled}
                  placeholder="мм"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F6A800] focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* Кнопка удаления */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Удалить характеристику"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {specifications.length > 0 && (
        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Совет:</p>
          <p>• Перетаскивайте элементы для изменения порядка</p>
          <p>• Оставьте поле &quot;Единица&quot; пустым, если единица измерения не нужна</p>
          <p>• Характеристики будут отображаться на странице товара</p>
        </div>
      )}
    </div>
  );
}