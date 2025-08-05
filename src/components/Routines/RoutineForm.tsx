'use client';

import React, { useState } from 'react';
import { Routine } from '@/types/routine';
import { useRoutine } from '@/context/RoutineContext';
import Button from '../Common/Button';

interface RoutineFormProps {
  routine?: Routine;
  onCancel: () => void;
  isDarkMode?: boolean;
}

export default function RoutineForm({ routine, onCancel, isDarkMode = false }: RoutineFormProps) {
  const { addRoutine, updateRoutine } = useRoutine();
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
    
    if (routine) {
      updateRoutine(routine.id, formData);
    } else {
      addRoutine(formData);
    }
    
    onCancel();
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
        <label className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          ルーチン名 *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder="例: 朝の運動"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          説明
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder="ルーチンの詳細説明..."
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          カテゴリー *
        </label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder="例: 健康, 学習, 仕事"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          目標頻度 *
        </label>
        <select
          name="targetFrequency"
          value={formData.targetFrequency}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="daily">毎日</option>
          <option value="weekly">週間</option>
          <option value="monthly">月間</option>
        </select>
      </div>

      {formData.targetFrequency !== 'daily' && (
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            目標回数
          </label>
          <input
            type="number"
            name="targetCount"
            value={formData.targetCount}
            onChange={handleChange}
            min="1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
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
        <label className={`text-sm ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          アクティブ
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          isDarkMode={isDarkMode}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          isDarkMode={isDarkMode}
        >
          {routine ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
}