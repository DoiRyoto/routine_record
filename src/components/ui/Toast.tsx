'use client';

import { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible?: boolean;
  onClose?: () => void;
  duration?: number;
}

export function Toast({ 
  message, 
  type = 'success', 
  isVisible = true, 
  onClose,
  duration = 3000 
}: ToastProps) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const typeStyles = {
    success: 'bg-green/90 text-white border-green',
    error: 'bg-red/90 text-white border-red',
    info: 'bg-blue/90 text-white border-blue',
  };

  const icons = {
    success: '✅',
    error: '❌', 
    info: 'ℹ️',
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 ${typeStyles[type]} px-6 py-4 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 ease-in-out`}
      data-testid="xp-notification"
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{icons[type]}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setShow(false);
            if (onClose) onClose();
          }}
          className="ml-2 text-white/80 hover:text-white text-lg"
          aria-label="通知を閉じる"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Toast manager context for global toast management
import { createContext, useContext, ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(prev => prev ? { ...prev, visible: false } : null);
    setTimeout(() => setToast(null), 300); // Wait for animation
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}