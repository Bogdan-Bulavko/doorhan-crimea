'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from './ProgressBar';

interface ParallelLoaderProps {
  children: React.ReactNode;
  loaders: Array<() => Promise<unknown>>;
  onComplete?: (results: unknown[]) => void;
  onError?: (error: Error) => void;
}

export function ParallelLoader({ 
  children, 
  loaders, 
  onComplete, 
  onError 
}: ParallelLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setProgress(0);

        const promises = loaders.map(async (loader) => {
          const result = await loader();
          setProgress((prev) => prev + (100 / loaders.length));
          return result;
        });

        const results = await Promise.all(promises);
        onComplete?.(results);
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [loaders, onComplete, onError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <div className="mt-4 text-gray-600">Загрузка данных...</div>
        <div className="mt-2 w-64 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#00205B] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for parallel data loading
export function useParallelLoader<T>(
  loaders: Array<() => Promise<T>>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const dependenciesString = JSON.stringify(dependencies);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const results = await Promise.all(loaders);
        setData(results);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loaders, dependenciesString]);

  return { data, isLoading, error };
}
