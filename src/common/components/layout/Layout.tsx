'use client';

import React from 'react';

import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray dark:bg-dark-gray">
      <Header />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
