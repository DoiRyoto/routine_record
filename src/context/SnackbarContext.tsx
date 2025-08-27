'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

import { Snackbar, type SnackbarMessage } from '@/components/ui/Snackbar';

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
      showSnackbar({ message, type: 'error', duration });
    },
    [showSnackbar]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showSnackbar({ message, type: 'info', duration });
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
        action: {
          label: actionLabel,
          onClick: actionCallback,
        },
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
          <Snackbar message={message} onClose={closeSnackbar} />
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
