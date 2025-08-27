'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

import Layout from '@/components/Layout/Layout';
import { SnackbarProvider } from '@/context/SnackbarContext';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }

      // MSWを開発環境でのみ初期化
      if (process.env.NODE_ENV === 'development') {
        import('@/mocks/browser').then(({ startWorker }) => {
          startWorker().catch(console.error);
        });
      }
    }
  }, []);

  // 認証が不要なページ
  const publicPages = ['/auth/signin', '/auth/signup'];
  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage) {
    return <SnackbarProvider>{children}</SnackbarProvider>;
  }

  return (
    <SnackbarProvider>
      <Layout>{children}</Layout>
    </SnackbarProvider>
  );
}
