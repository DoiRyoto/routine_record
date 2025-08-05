'use client';

import React from 'react';
import { Routine } from '@/types/routine';
import { useRoutine } from '@/context/RoutineContext';
import Button from '../Common/Button';

interface TodayRoutineItemProps {
  routine: Routine;
  isCompleted: boolean;
  isDarkMode?: boolean;
}

export default function TodayRoutineItem({ routine, isCompleted, isDarkMode = false }: TodayRoutineItemProps) {
  const { addExecutionRecord } = useRoutine();

  const handleComplete = () => {
    addExecutionRecord({
      routineId: routine.id,
      executedAt: new Date(),
      isCompleted: true,
    });
  };

  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className={`font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          } ${isCompleted ? 'line-through' : ''}`}>
            {routine.name}
          </h4>
          {routine.description && (
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {routine.description}
            </p>
          )}
          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
            isDarkMode 
              ? 'bg-blue-900 text-blue-200' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {routine.category}
          </span>
        </div>
        
        <div className="ml-4">
          {isCompleted ? (
            <span className={`text-sm ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              ✓ 完了
            </span>
          ) : (
            <Button
              onClick={handleComplete}
              size="sm"
              isDarkMode={isDarkMode}
            >
              完了
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}