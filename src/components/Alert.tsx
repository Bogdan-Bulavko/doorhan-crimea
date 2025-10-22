'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
}

interface AlertProps {
  alert: Alert;
  onRemove: (id: string) => void;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    buttonColor: 'hover:bg-green-100',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    buttonColor: 'hover:bg-red-100',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    buttonColor: 'hover:bg-yellow-100',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    buttonColor: 'hover:bg-blue-100',
  },
};

export function AlertComponent({ alert, onRemove }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(alert.id), 300); // Удаляем после анимации
    }, alert.duration || 5000);

    return () => clearTimeout(timer);
  }, [alert.id, alert.duration, onRemove]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(alert.id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            relative max-w-sm w-full mx-auto mb-4 p-4 rounded-lg border shadow-lg
            ${config.bgColor} ${config.borderColor}
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${config.textColor}`}>
                {alert.title}
              </h3>
              {alert.message && (
                <p className={`mt-1 text-sm ${config.textColor} opacity-90`}>
                  {alert.message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={handleRemove}
                className={`
                  inline-flex rounded-md p-1.5 transition-colors
                  ${config.textColor} ${config.buttonColor}
                `}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AlertContainerProps {
  alerts: Alert[];
  onRemove: (id: string) => void;
}

export function AlertContainer({ alerts, onRemove }: AlertContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <AlertComponent
          key={alert.id}
          alert={alert}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
