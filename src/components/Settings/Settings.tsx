'use client';

import React, { useState } from 'react';
import { useRoutine } from '@/context/RoutineContext';
import Card from '../Common/Card';
import Button from '../Common/Button';

export default function Settings() {
  const { userSettings, updateUserSettings, isDarkMode, toggleDarkMode } = useRoutine();
  const [formData, setFormData] = useState(userSettings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleChange = (
    section: 'displaySettings' | 'goalSettings',
    field: string,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleReset = () => {
    if (confirm('設定をリセットしますか？')) {
      const defaultSettings = {
        displaySettings: {
          theme: 'auto' as const,
          language: 'ja' as const,
          timeFormat: '24h' as const,
        },
        goalSettings: {
          dailyGoal: 3,
          weeklyGoal: 21,
          monthlyGoal: 90,
        },
      };
      setFormData(defaultSettings);
      updateUserSettings(defaultSettings);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        設定
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card isDarkMode={isDarkMode}>
          <h2 className={`text-lg font-medium mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            表示設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                テーマ
              </label>
              <select
                value={formData.displaySettings.theme}
                onChange={(e) => handleChange('displaySettings', 'theme', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
                <option value="auto">システム設定に従う</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                言語
              </label>
              <select
                value={formData.displaySettings.language}
                onChange={(e) => handleChange('displaySettings', 'language', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                時刻表示形式
              </label>
              <select
                value={formData.displaySettings.timeFormat}
                onChange={(e) => handleChange('displaySettings', 'timeFormat', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="12h">12時間表示</option>
                <option value="24h">24時間表示</option>
              </select>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={toggleDarkMode}
                variant="secondary"
                isDarkMode={isDarkMode}
              >
                {isDarkMode ? '🌙' : '☀️'} テーマを切り替え
              </Button>
            </div>
          </div>
        </Card>

        <Card isDarkMode={isDarkMode}>
          <h2 className={`text-lg font-medium mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            目標設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                1日の目標ルーチン数
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.goalSettings.dailyGoal}
                onChange={(e) => handleChange('goalSettings', 'dailyGoal', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                1週間の目標ルーチン数
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.goalSettings.weeklyGoal}
                onChange={(e) => handleChange('goalSettings', 'weeklyGoal', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                1ヶ月の目標ルーチン数
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.goalSettings.monthlyGoal}
                onChange={(e) => handleChange('goalSettings', 'monthlyGoal', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="danger"
            onClick={handleReset}
            isDarkMode={isDarkMode}
          >
            設定をリセット
          </Button>

          <div className="flex items-center space-x-4">
            {isSaved && (
              <span className={`text-sm ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                ✓ 保存しました
              </span>
            )}
            <Button
              type="submit"
              isDarkMode={isDarkMode}
            >
              設定を保存
            </Button>
          </div>
        </div>
      </form>

      <Card isDarkMode={isDarkMode}>
        <h2 className={`text-lg font-medium mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          アプリについて
        </h2>
        <div className={`space-y-2 text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <p>ルーチン記録アプリ v1.0.0</p>
          <p>日々の習慣を記録し、継続をサポートするアプリケーションです。</p>
          <p>データはブラウザのローカルストレージに保存されます。</p>
        </div>
      </Card>
    </div>
  );
}