'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function Header() {
  const pathname = usePathname();

  const navigationItems = [
    { href: '/', label: 'ダッシュボード' },
    { href: '/routines', label: 'ルーチン管理' },
    { href: '/calendar', label: 'カレンダー' },
    { href: '/statistics', label: '統計' },
    { href: '/settings', label: '設定' },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ルーチン記録
            </h1>
            
            <nav className="hidden md:flex space-x-6">
              {navigationItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-600 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        <nav className="md:hidden pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {navigationItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-600 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}