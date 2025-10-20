'use client';
import { useState } from 'react';

interface BulkActionsProps {
  selectedItems: number[];
  onBulkDelete: (ids: number[]) => Promise<void>;
  onBulkUpdate?: (ids: number[], updates: Record<string, string>) => Promise<void>;
  availableUpdates?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
}

export default function BulkActions({
  selectedItems,
  onBulkDelete,
  onBulkUpdate,
  availableUpdates = []
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [updateValues, setUpdateValues] = useState<Record<string, string>>({});

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkDelete(selectedItems);
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedItems.length === 0 || !onBulkUpdate) return;
    
    setIsProcessing(true);
    try {
      await onBulkUpdate(selectedItems, updateValues);
      setUpdateValues({});
    } catch (error) {
      console.error('Bulk update error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="text-sm text-blue-800">
          Выбрано: {selectedItems.length} элементов
        </div>
        
        <div className="flex flex-wrap gap-2">
          {availableUpdates.map((update) => (
            <div key={update.key} className="flex items-center gap-2">
              <label className="text-sm text-gray-600">{update.label}:</label>
              <select
                value={updateValues[update.key] || ''}
                onChange={(e) => setUpdateValues(prev => ({
                  ...prev,
                  [update.key]: e.target.value
                }))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Выберите...</option>
                {update.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          {onBulkUpdate && (
            <button
              onClick={handleBulkUpdate}
              disabled={isProcessing}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Обновление...' : 'Обновить'}
            </button>
          )}
          
          <button
            onClick={handleBulkDelete}
            disabled={isProcessing}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {isProcessing ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}
