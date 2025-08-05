'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Layout from '@/components/Layout/Layout';
import AuthGuard from '@/components/Auth/AuthGuard';

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
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <Layout>{children}</Layout>
    </AuthGuard>
  );
}