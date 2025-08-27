'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

import { Toast, ToastClose } from '@/components/ui/Toast';

interface SnackbarMessage {
  id: string;
  message: string;
  type: 'success' | 'destructive' | 'warning' | 'default';
  duration?: number;
}

interface SnackbarContextType {
  showSnackbar: (message: Omit<SnackbarMessage, 'id'>) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showWithAction: (
    message: string,
    type: SnackbarMessage['type'],
    actionLabel: string,
    actionCallback: () => void,
    duration?: number
  ) => string; // IDを返すように変更
  closeSnackbar: (id: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((messageData: Omit<SnackbarMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: SnackbarMessage = {
      ...messageData,
      id,
    };

    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showSnackbar({ message, type: 'success', duration });
    },
    [showSnackbar]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showSnackbar({ message, type: 'destructive', duration });
    },
    [showSnackbar]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showSnackbar({ message, type: 'default', duration });
    },
    [showSnackbar]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showSnackbar({ message, type: 'warning', duration });
    },
    [showSnackbar]
  );

  const showWithAction = useCallback(
    (
      message: string,
      type: SnackbarMessage['type'],
      actionLabel: string,
      actionCallback: () => void,
      duration?: number
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newMessage: SnackbarMessage = {
        message,
        type,
        duration,
        id,
      };

      setMessages((prev) => [...prev, newMessage]);
      return id; // IDを返す
    },
    []
  );

  const closeSnackbar = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const value = {
    showSnackbar,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showWithAction,
    closeSnackbar,
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}

      {/* Snackbarコンテナ */}
      {messages.map((message, index) => (
        <div
          key={message.id}
          className="fixed z-50"
          style={{
            bottom: `${20 + index * 80}px`,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Toast 
            variant={message.type}
          >
            {message.message}
            <ToastClose onClick={() => closeSnackbar(message.id)} />
          </Toast>
        </div>
      ))}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
