'use client';

import { useState, useTransition } from 'react';

export interface OptimisticUpdate<T> {
  data: T;
  isOptimistic: boolean;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (current: T, optimistic: T) => T
) {
  const [data, setData] = useState<OptimisticUpdate<T>>({
    data: initialData,
    isOptimistic: false
  });
  const [isPending, startTransition] = useTransition();

  const updateOptimistic = (optimisticData: T) => {
    startTransition(() => {
      setData({
        data: updateFn(data.data, optimisticData),
        isOptimistic: true
      });
    });
  };

  const confirmUpdate = (confirmedData: T) => {
    setData({
      data: confirmedData,
      isOptimistic: false
    });
  };

  const revertUpdate = () => {
    setData(prev => ({
      ...prev,
      isOptimistic: false
    }));
  };

  return {
    data: data.data,
    isOptimistic: data.isOptimistic,
    isPending,
    updateOptimistic,
    confirmUpdate,
    revertUpdate
  };
}

// Optimistic update for arrays
export function useOptimisticArray<T>(
  initialData: T[],
  keyExtractor: (item: T) => string | number
) {
  const [data, setData] = useState<OptimisticUpdate<T[]>>({
    data: initialData,
    isOptimistic: false
  });
  const [isPending, startTransition] = useTransition();

  const addOptimistic = (item: T) => {
    startTransition(() => {
      setData(prev => ({
        data: [...prev.data, item],
        isOptimistic: true
      }));
    });
  };

  const updateOptimistic = (id: string | number, updates: Partial<T>) => {
    startTransition(() => {
      setData(prev => ({
        data: prev.data.map(item => 
          keyExtractor(item) === id ? { ...item, ...updates } : item
        ),
        isOptimistic: true
      }));
    });
  };

  const removeOptimistic = (id: string | number) => {
    startTransition(() => {
      setData(prev => ({
        data: prev.data.filter(item => keyExtractor(item) !== id),
        isOptimistic: true
      }));
    });
  };

  const confirmUpdate = (confirmedData: T[]) => {
    setData({
      data: confirmedData,
      isOptimistic: false
    });
  };

  const revertUpdate = () => {
    setData(prev => ({
      ...prev,
      isOptimistic: false
    }));
  };

  return {
    data: data.data,
    isOptimistic: data.isOptimistic,
    isPending,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    confirmUpdate,
    revertUpdate
  };
}
