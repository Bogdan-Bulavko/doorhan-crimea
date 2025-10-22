'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Star, 
  StarOff, 
  GripVertical, 
  Image as ImageIcon,
  Video,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface ImageData {
  id: string;
  fileName: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  originalName: string;
  isMain?: boolean;
  sortOrder: number;
  altText?: string;
}

interface ImageUploadProps {
  images: ImageData[];
  onChange: (images: ImageData[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({ 
  images,
  onChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Функция для загрузки файла
  const uploadFile = useCallback(async (file: File): Promise<ImageData | null> => {
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
            fileName: string; 
            url: string; 
            size: number;
            originalName?: string;
            images?: Array<{ url: string; fileName: string }>;
          } 
        };
        
        if (data.type === 'video') {
        return {
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fileName: data.fileName,
          url: data.url,
          type: 'video',
          size: data.size,
          originalName: data.originalName || data.fileName,
          sortOrder: images.length,
        };
      } else {
        // Для изображений берем средний размер
        const mediumImage = data.images?.find((img) => img.fileName.includes('medium')) || data.images?.[0];
        if (!mediumImage) {
          throw new Error('Не удалось найти изображение');
        }
        return {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fileName: mediumImage.fileName,
          url: mediumImage.url,
          type: 'image',
          size: data.size,
          originalName: data.originalName || data.fileName,
          sortOrder: images.length,
        };
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }, [images.length]);

  // Обработка загрузки файлов
  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setErrors({ general: `Максимум ${maxImages} изображений` });
      return;
    }
    
    setUploading(true);
    setErrors({});

    for (const file of filesToUpload) {
      const fileId = `${file.name}_${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      try {
        const uploadedImage = await uploadFile(file);
        if (uploadedImage) {
          onChange([...images, uploadedImage]);
        }
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          [fileId]: error instanceof Error ? error.message : 'Ошибка загрузки'
        }));
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    }

    setUploading(false);
  }, [disabled, maxImages, onChange, uploadFile, images]);

  // Drag & Drop обработчики
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  // Удаление изображения
  const removeImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    try {
      // Удаляем файл с сервера
      await fetch(`/api/upload/image?fileName=${image.fileName}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete file error:', error);
    }

    // Удаляем из состояния
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // Если удаляем основное изображение, делаем первое основным
    if (image.isMain && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }

    // Обновляем порядок
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));

    onChange(reorderedImages);
  };

  // Установка основного изображения
  const setMainImage = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === imageId,
    }));
    onChange(updatedImages);
  };

  // Drag & Drop для изменения порядка
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropReorder = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newImages = [...images];
      const [draggedItem] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, draggedItem);
      
      // Обновляем порядок
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        sortOrder: index,
      }));
      
      onChange(reorderedImages);
    }
    setDraggedIndex(null);
  };

  // Открытие файлового диалога
  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#00205B]">
          Изображения товара
        </h3>
        <div className="text-sm text-gray-500">
          {images.length} / {maxImages}
        </div>
      </div>

      {/* Область загрузки */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive
            ? 'border-[#F6A800] bg-[#F6A800]/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
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
              {uploading ? 'Загрузка...' : 'Перетащите файлы сюда'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              или нажмите для выбора файлов
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Поддерживаются: JPG, PNG, WebP, GIF, MP4, WebM (до 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* Ошибки */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          {Object.entries(errors).map(([key, error]) => (
            <div key={key} className="flex items-center space-x-2 text-red-600">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Сетка изображений */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                draggable={!disabled}
                onDragStart={(e) => {
                  if (e.type === 'dragstart') {
                    handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, index);
                  }
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropReorder(e, index)}
                className={`relative group bg-white border rounded-lg overflow-hidden ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${disabled ? 'opacity-60' : ''}`}
              >
                {/* Основное изображение индикатор */}
                {image.isMain && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-[#F6A800] text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Star size={12} />
                      <span>Основное</span>
                    </div>
                  </div>
                )}

                {/* Drag handle */}
                {!disabled && (
                  <div className="absolute top-2 right-2 z-10 cursor-move text-white bg-black/50 rounded p-1">
                    <GripVertical size={14} />
                  </div>
                )}

                {/* Изображение/Видео */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {image.type === 'video' ? (
                    <div className="text-center">
                      <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Видео</p>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${image.url})` }}
                      title={image.altText || image.originalName}
                    />
                  )}
                </div>

                {/* Информация */}
                <div className="p-3">
                  <p className="text-xs text-gray-600 truncate" title={image.originalName}>
                    {image.originalName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(image.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>

                {/* Действия */}
                {!disabled && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {!image.isMain && (
                      <button
                        onClick={() => setMainImage(image.id)}
                        className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                        title="Сделать основным"
                      >
                        <StarOff size={16} />
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full transition-colors"
                      title="Удалить"
                    >
                      <X size={16} />
              </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Подсказки */}
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium mb-2">Изображения не добавлены</p>
          <p className="text-sm">
            Добавьте изображения товара для лучшего отображения
          </p>
        </div>
      )}

      {/* Прогресс загрузки */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Загрузка...</span>
                <span className="text-sm text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Советы */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-700 mb-1">💡 Советы:</p>
              <ul className="space-y-1 text-blue-600">
                <li>• Перетаскивайте изображения для изменения порядка</li>
                <li>• Нажмите на звездочку, чтобы сделать изображение основным</li>
                <li>• Изображения автоматически оптимизируются в WebP</li>
                <li>• Поддерживается загрузка видео (MP4, WebM)</li>
              </ul>
            </div>
          </div>
      </div>
      )}
    </div>
  );
}