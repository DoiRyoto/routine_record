'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';

import { Button } from '../ui/Button';

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/', label: 'ダッシュボード', icon: '🏠' },
    { href: '/routines', label: 'ルーティン', icon: '📋' },
    { href: '/missions', label: 'ミッション', icon: '🎯' },
    { href: '/challenges', label: 'チャレンジ', icon: '🏆' },
    { href: '/calendar', label: 'カレンダー', icon: '📅' },
    { href: '/statistics', label: '統計', icon: '📊' },
    { href: '/profile', label: 'プロフィール', icon: '👤' },
    { href: '/settings', label: '設定', icon: '⚙️' },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-bg-white backdrop-blur-sm border-b border-gray shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              data-testid="header-logo-link"
            >
              <div className="w-8 h-8 bg-blue dark:bg-dark-blue rounded-lg flex items-center justify-center">
                <span className="text-blue dark:text-blue font-bold text-sm">M</span>
              </div>
              <h1 className="text-lg font-semibold text-gray dark:text-gray hidden sm:block">
                ミッション記録
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1" data-testid="main-navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === item.href
                  ? 'bg-blue dark:bg-dark-blue text-blue dark:text-blue shadow-sm'
                  : 'text-gray dark:text-gray hover:text-gray dark:hover:text-gray hover:bg-gray dark:hover:bg-dark-gray'
                  }`}
                data-testid={`nav-link-${item.href === '/' ? 'dashboard' : item.href.slice(1)}`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-xs text-gray dark:text-gray font-medium">
                {user?.email?.split('@')[0]}
              </span>
              <Button onClick={signOut} variant="secondary" size="sm" className="text-xs" data-testid="signout-button">
                サインアウト
              </Button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray hover:bg-gray dark:text-gray dark:hover:bg-dark-gray transition-colors"
              aria-label="メニューを開く"
              data-testid="mobile-menu-toggle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray dark:border-dark-gray py-3" data-testid="mobile-menu">
            <nav className="flex flex-col space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === item.href
                    ? 'bg-blue dark:bg-dark-blue text-blue dark:text-blue'
                    : 'text-gray dark:text-gray hover:text-gray dark:hover:text-gray hover:bg-gray dark:hover:bg-dark-gray'
                    }`}
                  data-testid={`mobile-nav-link-${item.href === '/' ? 'dashboard' : item.href.slice(1)}`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="border-t border-gray dark:border-dark-gray mt-3 pt-3">
                <div className="px-3 py-2 text-xs text-gray dark:text-gray">
                  {user?.email}
                </div>
                <Button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="secondary"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  data-testid="mobile-signout-button"
                >
                  サインアウト
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
