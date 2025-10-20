'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  currentImage?: string;
  onRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
}

export default function ImageUpload({ 
  onUpload, 
  currentImage, 
  onRemove,
  accept = 'image/*',
  maxSize = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Файл слишком большой. Максимальный размер: ${maxSize}MB`);
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }
    
    setUploading(true);
    
    try {
      const imageUrl = await onUpload(file);
      setPreview(imageUrl);
    } catch (error) {
      setError('Ошибка загрузки изображения');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const displayImage = preview || currentImage;

  return (
    <div className="space-y-4">
      {displayImage && (
        <div className="relative inline-block">
          <Image
            src={displayImage}
            alt="Preview"
            width={128}
            height={128}
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Загрузка...
          </div>
        ) : (
          <div>
            <div className="text-gray-600 mb-2">
              Перетащите изображение сюда или{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:underline"
              >
                выберите файл
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Максимальный размер: {maxSize}MB
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}
