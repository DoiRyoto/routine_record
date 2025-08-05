'use client';

import React from 'react';
import { Routine } from '@/types/routine';
import { useRoutine } from '@/context/RoutineContext';
import Button from '../Common/Button';

interface TodayRoutineItemProps {
  routine: Routine;
  isCompleted: boolean;
}

export default function TodayRoutineItem({ routine, isCompleted }: TodayRoutineItemProps) {
  const { addExecutionRecord } = useRoutine();

  const handleComplete = () => {
    addExecutionRecord({
      routineId: routine.id,
      executedAt: new Date(),
      isCompleted: true,
    });
  };

  return (
    <div className={`p-4 rounded-lg border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className={`font-medium text-gray-900 dark:text-white ${isCompleted ? 'line-through' : ''}`}>
            {routine.name}
          </h4>
          {routine.description && (
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
              {routine.description}
            </p>
          )}
          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {routine.category}
          </span>
        </div>
        
        <div className="ml-4">
          {isCompleted ? (
            <span className="text-sm text-green-600 dark:text-green-400">
              ✓ 完了
            </span>
          ) : (
            <Button
              onClick={handleComplete}
              size="sm"
            >
              完了
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}