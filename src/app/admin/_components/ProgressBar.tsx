'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ProgressBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      if (isLoading) {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-[#00205B] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className="w-full h-full border-2 border-gray-300 border-t-[#00205B] rounded-full" />
    </div>
  );
}

export function LoadingButton({ 
  isLoading, 
  children, 
  className = '',
  ...props 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <button
      className={`relative ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  );
}
