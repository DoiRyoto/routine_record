'use client';

import React, { useState } from 'react';
import { useRoutine } from '@/context/RoutineContext';
import Card from '../Common/Card';
import Button from '../Common/Button';
import { ThemeSelect } from '../Common/ThemeSelect';

export default function Settings() {
  const { userSettings, updateUserSettings } = useRoutine();
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        設定
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            表示設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                テーマ
              </label>
              <ThemeSelect />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                言語
              </label>
              <select
                value={formData.displaySettings.language}
                onChange={(e) => handleChange('displaySettings', 'language', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white border-gray-300 text-gray-900
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                時刻表示形式
              </label>
              <select
                value={formData.displaySettings.timeFormat}
                onChange={(e) => handleChange('displaySettings', 'timeFormat', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white border-gray-300 text-gray-900
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="12h">12時間表示</option>
                <option value="24h">24時間表示</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            目標設定
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                1日の目標ルーチン数
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.goalSettings.dailyGoal}
                onChange={(e) => handleChange('goalSettings', 'dailyGoal', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white border-gray-300 text-gray-900
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                1週間の目標ルーチン数
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.goalSettings.weeklyGoal}
                onChange={(e) => handleChange('goalSettings', 'weeklyGoal', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white border-gray-300 text-gray-900
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                1ヶ月の目標ルーチン数
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.goalSettings.monthlyGoal}
                onChange={(e) => handleChange('goalSettings', 'monthlyGoal', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white border-gray-300 text-gray-900
                         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="danger"
            onClick={handleReset}

          >
            設定をリセット
          </Button>

          <div className="flex items-center space-x-4">
            {isSaved && (
              <span             className="text-sm text-green-600 dark:text-green-400">
                ✓ 保存しました
              </span>
            )}
            <Button
              type="submit"
  
            >
              設定を保存
            </Button>
          </div>
        </div>
      </form>

      <Card>
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          アプリについて
        </h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>ルーチン記録アプリ v1.0.0</p>
          <p>日々の習慣を記録し、継続をサポートするアプリケーションです。</p>
          <p>データはブラウザのローカルストレージに保存されます。</p>
        </div>
      </Card>
    </div>
  );
}