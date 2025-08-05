'use client';

import React, { useState, useEffect } from 'react';
import { Routine } from '@/types/routine';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import RoutineForm from './RoutineForm';

interface RoutineListProps {
  routines: Routine[];
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
  onAdd: (routine: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
}

export default function RoutineList({ routines, onEdit, onDelete, onAdd }: RoutineListProps) {
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredRoutines = routines.filter(routine => {
    if (filter === 'all') return true;
    if (filter === 'active') return routine.isActive;
    if (filter === 'inactive') return !routine.isActive;
    return routine.category.toLowerCase().includes(filter.toLowerCase());
  });

  const categories = Array.from(new Set(routines.map(r => r.category)));

  const handleEdit = (routine: Routine) => {
    if (!isMounted) return;
    console.log('編集ボタンがクリックされました:', routine.name);
    setEditingRoutine(routine);
    setIsFormModalOpen(true);
  };

  const handleDelete = (routine: Routine) => {
    if (confirm(`「${routine.name}」を削除しますか？`)) {
      onDelete(routine.id);
    }
  };

  const handleCloseModal = () => {
    console.log('モーダルを閉じます');
    setIsFormModalOpen(false);
    setEditingRoutine(null);
  };

  const handleFormSubmit = (routineData: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingRoutine) {
      onEdit({ ...editingRoutine, ...routineData });
    } else {
      onAdd(routineData);
    }
    handleCloseModal();
  };

  // マウント前は読み込み中を表示
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ルーチン管理
        </h1>
        <div className="text-center py-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ルーチン管理
        </h1>
        
        <Button
          onClick={() => {
            if (!isMounted) return;
            console.log('新しいルーチンボタンがクリックされました');
            setIsFormModalOpen(true);
          }}
        >
          + 新しいルーチン
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          すべて ({routines.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          アクティブ ({routines.filter(r => r.isActive).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === 'inactive'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          非アクティブ ({routines.filter(r => !r.isActive).length})
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category} ({routines.filter(r => r.category === category).length})
          </button>
        ))}
      </div>

      {filteredRoutines.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {filter === 'all' ? 'ルーチンがありません' : `${filter}のルーチンがありません`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutines.map(routine => (
            <div
              key={routine.id}
              className={`p-6 rounded-lg border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${
                !routine.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {routine.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  routine.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {routine.isActive ? 'アクティブ' : '非アクティブ'}
                </span>
              </div>
              
              {routine.description && (
                <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
                  {routine.description}
                </p>
              )}
              
              <div className="space-y-2 mb-4">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {routine.category}
                </span>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  頻度: {
                    routine.targetFrequency === 'daily' ? '毎日' :
                    routine.targetFrequency === 'weekly' ? `週${routine.targetCount || 1}回` :
                    `月${routine.targetCount || 1}回`
                  }
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  作成日: {routine.createdAt.toLocaleDateString('ja-JP')}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(routine)}
                >
                  編集
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(routine)}
                >
                  削除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        title={editingRoutine ? 'ルーチン編集' : '新しいルーチン'}
      >
        <RoutineForm
          routine={editingRoutine || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}