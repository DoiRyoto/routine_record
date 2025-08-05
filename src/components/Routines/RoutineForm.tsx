'use client';

import React, { useState } from 'react';
import { Routine } from '@/types/routine';
// RoutineContext is no longer needed
import Button from '../Common/Button';

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
    targetFrequency: routine?.targetFrequency || 'daily' as const,
    targetCount: routine?.targetCount || 1,
    isActive: routine?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('フォーム送信:', { isEdit: !!routine, formData });
    
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
          ルーチン名 *
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
          placeholder="ルーチンの詳細説明..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
          カテゴリー *
        </label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                     bg-white border-gray-300 text-gray-900 placeholder-gray-500
                     dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          placeholder="例: 健康, 学習, 仕事"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
          目標頻度 *
        </label>
        <div className="relative">
          <select
            name="targetFrequency"
            value={formData.targetFrequency}
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
          </select>
          
          {/* カスタム矢印アイコン */}
          <div className="
            absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none
            text-gray-500 dark:text-slate-400
          ">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {formData.targetFrequency !== 'daily' && (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-200">
            目標回数
          </label>
          <input
            type="number"
            name="targetCount"
            value={formData.targetCount}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white border-gray-300 text-gray-900
                       dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
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
        <label className="text-sm text-gray-700 dark:text-slate-200">
          アクティブ
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}

        >
          キャンセル
        </Button>
        <Button
          type="submit"

        >
          {routine ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
}