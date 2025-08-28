'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // テーマの初期化とシステムテーマ監視
  useEffect(() => {
    // ローカルストレージからテーマを取得
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      setThemeState('auto');
    }

    // システムテーマの変更を監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      updateResolvedTheme(theme || 'auto');
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // 解決されたテーマを更新する関数
  const updateResolvedTheme = (currentTheme: Theme) => {
    let newResolvedTheme: 'light' | 'dark' = 'light';

    if (currentTheme === 'dark') {
      newResolvedTheme = 'dark';
    } else if (currentTheme === 'light') {
      newResolvedTheme = 'light';
    } else { // auto
      newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setResolvedTheme(newResolvedTheme);
    
    // DOMクラスを更新
    document.documentElement.classList.toggle('dark', newResolvedTheme === 'dark');
  };

  // テーマが変更されるたびに解決されたテーマを更新
  useEffect(() => {
    updateResolvedTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    // ローカルストレージに保存
    if (newTheme === 'auto') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}