'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertContainer, Alert } from '@/components/Alert';

interface AlertContextType {
  showAlert: (alert: Omit<Alert, 'id'>) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  removeAlert: (id: string) => void;
  clearAll: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((alert: Omit<Alert, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert: Alert = { ...alert, id };
    
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showAlert({ type: 'success', title, message, duration });
  }, [showAlert]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showAlert({ type: 'error', title, message, duration });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    showAlert({ type: 'warning', title, message, duration });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    showAlert({ type: 'info', title, message, duration });
  }, [showAlert]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeAlert,
        clearAll,
      }}
    >
      {children}
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
