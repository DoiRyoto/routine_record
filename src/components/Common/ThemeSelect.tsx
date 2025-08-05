'use client';

import { useTheme } from '@/hooks/useTheme';
import React from 'react';

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                 bg-white border-gray-300 text-gray-900
                 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      <option value="light">ライト</option>
      <option value="dark">ダーク</option>
      <option value="system">システム設定に従う</option>
    </select>
  );
}