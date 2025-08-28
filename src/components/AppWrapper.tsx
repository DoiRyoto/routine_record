'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

import Layout from '@/components/Layout/Layout';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { ThemeProvider } from '@/context/ThemeContext';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // MSW初期化（開発環境のみ）
      if (process.env.NODE_ENV === 'development') {
        import('@/mocks/browser').then(({ startWorker }) => {
          startWorker();
        }).catch((error) => {
          console.warn('MSW初期化エラー:', error);
        });
      }
    }
  }, []);

  // 認証が不要なページ
  const publicPages = ['/auth/signin', '/auth/signup'];
  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage) {
    return (
      <ThemeProvider>
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SnackbarProvider>
        <Layout>{children}</Layout>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
