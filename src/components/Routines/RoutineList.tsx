'use client';

import React, { useState } from 'react';
import { Routine } from '@/types/routine';
import { useRoutine } from '@/context/RoutineContext';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import RoutineForm from './RoutineForm';

export default function RoutineList() {
  const { routines, deleteRoutine, isDarkMode } = useRoutine();
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filteredRoutines = routines.filter(routine => {
    if (filter === 'all') return true;
    if (filter === 'active') return routine.isActive;
    if (filter === 'inactive') return !routine.isActive;
    return routine.category.toLowerCase().includes(filter.toLowerCase());
  });

  const categories = Array.from(new Set(routines.map(r => r.category)));

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsFormModalOpen(true);
  };

  const handleDelete = (routine: Routine) => {
    if (confirm(`「${routine.name}」を削除しますか？`)) {
      deleteRoutine(routine.id);
    }
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingRoutine(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          ルーチン管理
        </h1>
        
        <Button
          onClick={() => setIsFormModalOpen(true)}
          isDarkMode={isDarkMode}
        >
          + 新しいルーチン
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === 'all'
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-600 text-white'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          すべて ({routines.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === 'active'
              ? isDarkMode
                ? 'bg-green-600 text-white'
                : 'bg-green-600 text-white'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          アクティブ ({routines.filter(r => r.isActive).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === 'inactive'
              ? isDarkMode
                ? 'bg-red-600 text-white'
                : 'bg-red-600 text-white'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                ? isDarkMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-600 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category} ({routines.filter(r => r.category === category).length})
          </button>
        ))}
      </div>

      {filteredRoutines.length === 0 ? (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {filter === 'all' ? 'ルーチンがありません' : `${filter}のルーチンがありません`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutines.map(routine => (
            <div
              key={routine.id}
              className={`p-6 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } ${!routine.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {routine.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  routine.isActive
                    ? isDarkMode
                      ? 'bg-green-900 text-green-200'
                      : 'bg-green-100 text-green-800'
                    : isDarkMode
                      ? 'bg-red-900 text-red-200'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {routine.isActive ? 'アクティブ' : '非アクティブ'}
                </span>
              </div>
              
              {routine.description && (
                <p className={`text-sm mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {routine.description}
                </p>
              )}
              
              <div className="space-y-2 mb-4">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  isDarkMode 
                    ? 'bg-blue-900 text-blue-200' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {routine.category}
                </span>
                
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  頻度: {
                    routine.targetFrequency === 'daily' ? '毎日' :
                    routine.targetFrequency === 'weekly' ? `週${routine.targetCount || 1}回` :
                    `月${routine.targetCount || 1}回`
                  }
                </div>
                
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  作成日: {routine.createdAt.toLocaleDateString('ja-JP')}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(routine)}
                  isDarkMode={isDarkMode}
                >
                  編集
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(routine)}
                  isDarkMode={isDarkMode}
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
        isDarkMode={isDarkMode}
      >
        <RoutineForm
          routine={editingRoutine || undefined}
          onCancel={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      </Modal>
    </div>
  );
}