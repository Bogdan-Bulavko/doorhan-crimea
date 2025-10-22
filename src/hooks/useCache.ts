'use client';

import { useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

export function useCache<T>(ttl: number = 5 * 60 * 1000) { // 5 minutes default
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = (key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data;
  };

  const set = (key: string, data: T, customTtl?: number): void => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
    });
  };

  const clear = (key?: string): void => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  };

  const has = (key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return false;
    }

    return true;
  };

  return { get, set, clear, has };
}
