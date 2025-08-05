'use client';

import React from 'react';
import { useRoutine } from '@/context/RoutineContext';

export default function Header() {
  const { currentView, setCurrentView, isDarkMode, toggleDarkMode } = useRoutine();

  const navigationItems = [
    { key: 'dashboard', label: 'ダッシュボード' },
    { key: 'routines', label: 'ルーチン管理' },
    { key: 'calendar', label: 'カレンダー' },
    { key: 'statistics', label: '統計' },
    { key: 'settings', label: '設定' },
  ] as const;

  return (
    <header className={`sticky top-0 z-50 border-b ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ルーチン記録
            </h1>
            
            <nav className="hidden md:flex space-x-6">
              {navigationItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.key
                      ? isDarkMode
                        ? 'bg-blue-900 text-blue-100'
                        : 'bg-blue-100 text-blue-900'
                      : isDarkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-md transition-colors ${
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="テーマ切り替え"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>
        
        <nav className="md:hidden pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {navigationItems.map(item => (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  currentView === item.key
                    ? isDarkMode
                      ? 'bg-blue-900 text-blue-100'
                      : 'bg-blue-100 text-blue-900'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}