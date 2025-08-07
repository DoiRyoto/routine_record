'use client';

import React, { useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';

import Button from '../Common/Button';
import Card from '../Common/Card';
import ConfirmDialog from '../Common/ConfirmDialog';
import { ThemeSelect } from '../Common/ThemeSelect';

interface Props {
  initialSettings: UserSettingWithTimezone;
}

export default function SettingsClientPage({ initialSettings }: Props) {
  const [formData, setFormData] = useState(initialSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('設定の更新に失敗しました');
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      // 設定の更新に失敗
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetRequest = () => {
    setShowResetDialog(true);
  };

  const handleResetConfirm = async () => {
    const defaultSettings: UserSettingWithTimezone = {
      ...initialSettings,
      theme: 'auto' as const,
      language: 'ja' as const,
      timeFormat: '24h' as const,
    };
    setFormData(defaultSettings);
    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultSettings),
      });

      if (!response.ok) {
        throw new Error('設定のリセットに失敗しました');
      }
    } catch {
      // 設定のリセットに失敗
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">設定</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">表示設定</h2>

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
              <div className="relative">
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           bg-white text-gray-900 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white
                           dark:focus:ring-blue-400 dark:focus:border-blue-400
                           appearance-none cursor-pointer transition-colors"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                時刻表示形式
              </label>
              <div className="relative">
                <select
                  value={formData.timeFormat}
                  onChange={(e) => handleChange('timeFormat', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           bg-white text-gray-900 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white
                           dark:focus:ring-blue-400 dark:focus:border-blue-400
                           appearance-none cursor-pointer transition-colors"
                >
                  <option value="12h">12時間表示</option>
                  <option value="24h">24時間表示</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center pt-4">
          <Button type="button" variant="danger" onClick={handleResetRequest}>
            設定をリセット
          </Button>

          <div className="flex items-center space-x-4">
            {isSaved && (
              <span className="text-sm text-green-600 dark:text-green-400">✓ 保存しました</span>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : '設定を保存'}
            </Button>
          </div>
        </div>
      </form>

      {/* リセット確認ダイアログ */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleResetConfirm}
        title="設定をリセット"
        message="すべての設定をデフォルト値に戻します。この操作は元に戻せません。"
        confirmText="リセット"
        cancelText="キャンセル"
        variant="danger"
      />
    </div>
  );
}
