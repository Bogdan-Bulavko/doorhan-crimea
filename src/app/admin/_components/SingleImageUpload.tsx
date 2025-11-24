'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
}

export default function SingleImageUpload({
  value,
  onChange,
  disabled = false,
  label = 'Изображение статьи',
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Ошибка загрузки');
      }

      const { data } = result as {
        data: {
          type: string;
          images?: Array<{ url: string; fileName: string }>;
          url?: string;
        };
      };

      // Для изображений берем средний размер, для видео - прямой URL
      if (data.type === 'video' && data.url) {
        return data.url;
      } else if (data.images && data.images.length > 0) {
        // Берем средний размер или первый доступный
        const mediumImage = data.images.find((img) => img.fileName.includes('medium')) || data.images[0];
        return mediumImage.url;
      }

      throw new Error('Не удалось получить URL изображения');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (disabled || !files || files.length === 0) return;

      const file = files[0];
      setError(null);
      setUploading(true);

      try {
        const url = await uploadFile(file);
        if (url) {
          onChange(url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setUploading(false);
      }
    },
    [disabled, uploadFile, onChange]
  );

  const handleRemove = useCallback(async () => {
    if (disabled) return;

    // Если есть старое изображение, можно попытаться удалить его с сервера
    // Но для простоты просто очищаем значение
    onChange('');
    setError(null);
  }, [disabled, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || uploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    },
    [disabled, uploading, handleFileSelect]
  );

  const openFileDialog = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-600 mb-1">{label}</label>

      {value ? (
        <div className="relative group">
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={value}
              alt="Изображение статьи"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={handleRemove}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  title="Удалить изображение"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={openFileDialog}
              className="mt-2 text-sm text-[#00205B] hover:text-[#F6A800] transition-colors"
            >
              Заменить изображение
            </button>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? 'border-[#F6A800] bg-[#F6A800]/5'
              : uploading
              ? 'border-[#F6A800] bg-[#F6A800]/5'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={openFileDialog}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled || uploading}
          />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-[#F6A800] animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <div>
              <p className="text-lg font-medium text-gray-700">
                {uploading ? 'Загрузка...' : dragActive ? 'Отпустите для загрузки' : 'Перетащите файл сюда'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {!dragActive && !uploading && 'или нажмите для выбора файла'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Поддерживаются: JPG, PNG, WebP, GIF (до 50MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {value && (
        <p className="text-xs text-gray-500">
          URL: <span className="font-mono">{value}</span>
        </p>
      )}
    </div>
  );
}

