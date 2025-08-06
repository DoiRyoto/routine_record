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
