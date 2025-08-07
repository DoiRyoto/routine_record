'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                   bg-white text-gray-900 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white
                   dark:focus:ring-blue-400 dark:focus:border-blue-400
                   appearance-none cursor-pointer transition-colors"
      >
        <option value="light">ライト</option>
        <option value="dark">ダーク</option>
        <option value="system">システム設定に従う</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
