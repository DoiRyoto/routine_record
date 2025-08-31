'use client';

import React from 'react';

import Layout from '@/common/components/layout/Layout';
import { AuthProvider } from '@/common/context/AuthContext';
import { SnackbarProvider } from '@/common/context/SnackbarContext';
import { ThemeProvider } from '@/common/context/ThemeContext';

interface StorybookWrapperProps {
  children: React.ReactNode;
  withLayout?: boolean;
  withAuth?: boolean;
}

export const StorybookWrapper: React.FC<StorybookWrapperProps> = ({ 
  children, 
  withLayout = true,
  withAuth = true 
}) => {
  let content = children;

  if (withLayout) {
    content = <Layout>{content}</Layout>;
  }

  content = (
    <ThemeProvider>
      <SnackbarProvider>
        {content}
      </SnackbarProvider>
    </ThemeProvider>
  );

  if (withAuth) {
    content = <AuthProvider>{content}</AuthProvider>;
  }

  return <>{content}</>;
};

// プリセット
export const WithLayoutAndAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StorybookWrapper withLayout={true} withAuth={true}>
    {children}
  </StorybookWrapper>
);

export const WithLayoutOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StorybookWrapper withLayout={true} withAuth={false}>
    {children}
  </StorybookWrapper>
);

export const WithProvidersOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StorybookWrapper withLayout={false} withAuth={true}>
    {children}
  </StorybookWrapper>
);

export const WithAuthPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StorybookWrapper withLayout={false} withAuth={true}>
    {children}
  </StorybookWrapper>
);