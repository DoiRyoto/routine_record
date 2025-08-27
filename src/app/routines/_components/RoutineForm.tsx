'use client';

import React, { useState } from 'react';


// RoutineContext is no longer needed
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import type { Routine } from '@/types/routine';

interface RoutineFormProps {
  routine?: Routine;
  onSubmit: (routine: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function RoutineForm({ routine, onSubmit, onCancel }: RoutineFormProps) {
  const [formData, setFormData] = useState({
    name: routine?.name || '',
    description: routine?.description || '',
    category: routine?.category || '',
    
    // ミッションタイプ
    goalType: routine?.goalType || ('schedule_based' as const),
    
    // 頻度ベース用
    targetCount: routine?.targetCount || 1,
    targetPeriod: routine?.targetPeriod || 'weekly',
    
    // スケジュールベース用の繰り返しパターン設定
    recurrenceType: routine?.recurrenceType || ('daily' as const),
    recurrenceInterval: routine?.recurrenceInterval || 1,
    
    // 月次パターン用
    monthlyType: routine?.monthlyType || ('day_of_month' as const),
    dayOfMonth: routine?.dayOfMonth || 1,
    weekOfMonth: routine?.weekOfMonth || 1,
    dayOfWeek: routine?.dayOfWeek || 1,
    
    // 週次パターン用
    daysOfWeek: routine?.daysOfWeek ? JSON.parse(routine.daysOfWeek) : [1],
    
    // カスタム間隔用
    startDate: routine?.startDate ? new Date(routine.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    
    isActive: routine?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      daysOfWeek: JSON.stringify(formData.daysOfWeek),
      startDate: new Date(formData.startDate),
    };
    
    onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseInt(value) || 1
          : type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  const handleTargetCountChange = (targetCount: number) => {
    setFormData((prev) => ({
      ...prev,
      targetCount,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
          ミッション名 *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                     bg-white border-gray-300 text-gray-900 placeholder-gray-500
                     dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          placeholder="例: 朝の運動"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
          説明
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                     bg-white border-gray-300 text-gray-900 placeholder-gray-500
                     dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          placeholder="ミッションの詳細説明..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-200">
          カテゴリー *
        </label>
        <Select value={formData.category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="カテゴリを選択..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="学習">学習</SelectItem>
            <SelectItem value="運動">運動</SelectItem>
            <SelectItem value="健康">健康</SelectItem>
            <SelectItem value="趣味">趣味</SelectItem>
            <SelectItem value="家事">家事</SelectItem>
            <SelectItem value="その他">その他</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
          ミッションタイプ *
        </label>
        <div className="relative">
          <select
            name="goalType"
            value={formData.goalType}
            onChange={handleChange}
            className="
              w-full px-3 py-2 pr-10 border rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              appearance-none cursor-pointer
              bg-white border-gray-300 text-gray-900
              dark:bg-slate-700 dark:border-slate-600 dark:text-white
            "
          >
            <option value="frequency_based">頻度ベース（○回/期間）</option>
            <option value="schedule_based">スケジュールベース（特定日実行）</option>
          </select>

          {/* カスタム矢印アイコン */}
          <div
            className="
            absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none
            text-gray-500 dark:text-slate-400
          "
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* 頻度ベースの設定 */}
      {formData.goalType === 'frequency_based' && (
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white">頻度目標設定</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
                期間 *
              </label>
              <select
                name="targetPeriod"
                value={formData.targetPeriod}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 border rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  bg-white border-gray-300 text-gray-900
                  dark:bg-slate-700 dark:border-slate-600 dark:text-white
                "
              >
                <option value="weekly">週</option>
                <option value="monthly">月</option>
                <option value="daily">日</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="targetCount">目標回数 *</Label>
              <input
                id="targetCount"
                type="number"
                value={formData.targetCount}
                onChange={(e) => handleTargetCountChange(parseInt(e.target.value) || 1)}
                min="1"
                max="50"
                step="1"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                           bg-white border-gray-300 text-gray-900
                           dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            例：「週に3回」「月に5回」など、期間内で達成したい実行回数を設定
          </div>
        </div>
      )}

      {/* スケジュールベースの設定 */}
      {formData.goalType === 'schedule_based' && (
        <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white">スケジュール設定</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
              繰り返しパターン *
            </label>
            <div className="relative">
              <select
                name="recurrenceType"
                value={formData.recurrenceType}
                onChange={handleChange}
                className="
                  w-full px-3 py-2 pr-10 border rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 
                  appearance-none cursor-pointer
                  bg-white border-gray-300 text-gray-900
                  dark:bg-slate-700 dark:border-slate-600 dark:text-white
                "
              >
                <option value="daily">毎日</option>
                <option value="weekly">週間</option>
                <option value="monthly">月間</option>
                <option value="custom">カスタム</option>
              </select>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            例：「毎日」「毎週月水金」「第一月曜」など、特定のスケジュールで実行
          </div>
        </div>
      )}

      {/* スケジュールベースの詳細設定 */}
      {formData.goalType === 'schedule_based' && formData.recurrenceType === 'weekly' && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-200">
            曜日選択
          </label>
          <div className="grid grid-cols-7 gap-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <button
                key={index}
                type="button"
                className={`
                  p-2 text-sm rounded-md border transition-colors
                  ${formData.daysOfWeek.includes(index)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600'
                  }
                `}
                onClick={() => {
                  const newDays = formData.daysOfWeek.includes(index)
                    ? formData.daysOfWeek.filter((d: number) => d !== index)
                    : [...formData.daysOfWeek, index];
                  setFormData(prev => ({ ...prev, daysOfWeek: newDays }));
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {formData.goalType === 'schedule_based' && formData.recurrenceType === 'monthly' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-200">
              月間繰り返し種類
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="monthlyType"
                  value="day_of_month"
                  checked={formData.monthlyType === 'day_of_month'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-slate-200">月の特定日</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="monthlyType"
                  value="day_of_week"
                  checked={formData.monthlyType === 'day_of_week'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-slate-200">第○曜日</span>
              </label>
            </div>
          </div>

          {formData.monthlyType === 'day_of_month' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
                日付（1-31）
              </label>
              <input
                type="number"
                name="dayOfMonth"
                value={formData.dayOfMonth}
                onChange={handleChange}
                min="1"
                max="31"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                           bg-white border-gray-300 text-gray-900
                           dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          )}

          {formData.monthlyType === 'day_of_week' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
                  第○週（-1は最終週）
                </label>
                <select
                  name="weekOfMonth"
                  value={formData.weekOfMonth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                             bg-white border-gray-300 text-gray-900
                             dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="1">第1週</option>
                  <option value="2">第2週</option>
                  <option value="3">第3週</option>
                  <option value="4">第4週</option>
                  <option value="-1">最終週</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
                  曜日
                </label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                             bg-white border-gray-300 text-gray-900
                             dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="0">日曜日</option>
                  <option value="1">月曜日</option>
                  <option value="2">火曜日</option>
                  <option value="3">水曜日</option>
                  <option value="4">木曜日</option>
                  <option value="5">金曜日</option>
                  <option value="6">土曜日</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {formData.goalType === 'schedule_based' && formData.recurrenceType === 'custom' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
              間隔（日）
            </label>
            <input
              type="number"
              name="recurrenceInterval"
              value={formData.recurrenceInterval}
              onChange={handleChange}
              min="1"
              max="365"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white border-gray-300 text-gray-900
                         dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="例: 3（3日おき）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
              開始日
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white border-gray-300 text-gray-900
                         dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        </div>
      )}


      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm text-gray-700 dark:text-slate-200">アクティブ</label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">{routine ? '更新' : '作成'}</Button>
      </div>
    </form>
  );
}
