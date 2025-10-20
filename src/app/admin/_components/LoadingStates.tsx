'use client';

import { LoadingSpinner } from './ProgressBar';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  message = 'Загрузка...', 
  size = 'md' 
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size={size} />
      <div className="mt-4 text-gray-600">{message}</div>
    </div>
  );
}

export function ErrorState({ 
  message = 'Произошла ошибка',
  onRetry 
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <div className="text-gray-600 mb-4">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#001a4a] transition-colors"
        >
          Попробовать снова
        </button>
      )}
    </div>
  );
}

export function EmptyState({ 
  message = 'Данные не найдены',
  action 
}: { 
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 text-6xl mb-4">📭</div>
      <div className="text-gray-600 mb-4">{message}</div>
      {action}
    </div>
  );
}

// Loading overlay for forms
export function LoadingOverlay({ 
  isLoading, 
  children 
}: { 
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" />
            <div className="mt-2 text-gray-600">Сохранение...</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline loading indicator
export function InlineLoading({ 
  isLoading, 
  children 
}: { 
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute top-2 right-2">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
}
