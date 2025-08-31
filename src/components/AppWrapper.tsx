'use client';

import React, { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { SnackbarProvider } from '@/common/context/SnackbarContext';
import { ThemeProvider } from '@/common/context/ThemeContext';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const _pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // MSW初期化（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        import('@/mocks/browser')
          .then(({ startWorker }) => {
            startWorker();
          })
          .catch((error) => {
            console.warn('MSW初期化エラー:', error);
          });
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <SnackbarProvider>{children}</SnackbarProvider>
    </ThemeProvider>
  );
}
