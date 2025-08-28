'use client';

import React, { useState } from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useTheme } from '@/context/ThemeContext';
import { apiClient } from '@/lib/api-client/endpoints';
import type { UserSetting } from '@/lib/db/schema';

interface SettingsPageProps {
  initialSettings: UserSetting;
}

export default function SettingsPage({
  initialSettings,
}: SettingsPageProps) {
  const [formData, setFormData] = useState(initialSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await apiClient.userSettings.update(formData);
      
      if (result.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch (error) {
      console.error('設定の更新に失敗しました:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev: UserSetting) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetRequest = () => {
    setShowResetDialog(true);
  };

  const handleResetConfirm = async () => {
    const defaultSettings: UserSetting = {
      ...initialSettings,
      theme: 'auto' as const,
      language: 'ja' as const,
      timeFormat: '24h' as const,
    };
    setFormData(defaultSettings);
    try {
      await apiClient.userSettings.update(defaultSettings);
    } catch (error) {
      console.error('設定のリセットに失敗しました:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray dark:text-gray">設定</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-medium mb-4 text-gray dark:text-gray">表示設定</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray dark:text-gray">
                テーマ
              </label>
              <Select 
                value={formData.theme} 
                onValueChange={(value: 'auto' | 'light' | 'dark') => {
                  setFormData(prev => ({ ...prev, theme: value }));
                  // リアルタイムでテーマを適用
                  setTheme(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">ライト</SelectItem>
                  <SelectItem value="dark">ダーク</SelectItem>
                  <SelectItem value="auto">自動</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray dark:text-gray mt-1">
                現在のテーマ: {theme === 'auto' ? '自動' : theme === 'light' ? 'ライト' : 'ダーク'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray dark:text-gray">
                言語
              </label>
              <div className="relative">
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-3 border border-gray rounded-lg 
                           bg-white text-gray 
                           focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue
                           dark:bg-dark-gray dark:border-dark-gray dark:text-gray
                           dark:focus:ring-blue dark:focus:border-blue
                           appearance-none cursor-pointer transition-colors"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray dark:text-gray"
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
              <label className="block text-sm font-medium mb-2 text-gray dark:text-gray">
                時刻表示形式
              </label>
              <div className="relative">
                <select
                  value={formData.timeFormat}
                  onChange={(e) => handleChange('timeFormat', e.target.value)}
                  className="w-full px-4 py-3 border border-gray rounded-lg 
                           bg-white text-gray 
                           focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue
                           dark:bg-dark-gray dark:border-dark-gray dark:text-gray
                           dark:focus:ring-blue dark:focus:border-blue
                           appearance-none cursor-pointer transition-colors"
                >
                  <option value="12h">12時間表示</option>
                  <option value="24h">24時間表示</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray dark:text-gray"
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
              <span className="text-sm text-green dark:text-green-400">✓ 保存しました</span>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : '設定を保存'}
            </Button>
          </div>
        </div>
      </form>

      {/* リセット確認ダイアログ */}
      <AlertDialog open={showResetDialog} onOpenChange={(open) => !open && setShowResetDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>設定をリセット</AlertDialogTitle>
            <AlertDialogDescription>
              すべての設定をデフォルト値に戻します。この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetDialog(false)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm} className="bg-red hover:bg-red">
              リセット
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}