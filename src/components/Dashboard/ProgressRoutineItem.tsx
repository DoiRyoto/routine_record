'use client';

import type { ExecutionRecord, Routine } from '@/types/routine';

import Button from '../Common/Button';

interface ProgressRoutineItemProps {
  routine: Routine & {
    executedCount: number;
    targetCount: number;
    progress: number;
    isCompleted: boolean;
  };
  frequencyType: 'weekly' | 'monthly';
  onComplete: (record: Omit<ExecutionRecord, 'id'>) => Promise<void>;
}

export default function ProgressRoutineItem({
  routine,
  frequencyType,
  onComplete,
}: ProgressRoutineItemProps) {
  const handleComplete = async () => {
    await onComplete({
      routineId: routine.id,
      executedAt: new Date(),
      duration: null,
      memo: null,
      isCompleted: true,
    });
  };

  const getFrequencyLabel = () => {
    return frequencyType === 'weekly' ? '今週' : '今月';
  };

  const getProgressColor = () => {
    if (routine.isCompleted) return 'bg-green-500';
    if (routine.progress >= 75) return 'bg-blue-500';
    if (routine.progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getProgressTextColor = () => {
    if (routine.isCompleted) return 'text-green-600 dark:text-green-400';
    if (routine.progress >= 75) return 'text-blue-600 dark:text-blue-400';
    if (routine.progress >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div
      className={`p-4 rounded-lg border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${
        routine.isCompleted ? 'opacity-80' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">{routine.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{routine.description}</p>
          <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {routine.category}
          </span>
        </div>

        <div className="ml-4">
          {routine.isCompleted ? (
            <span className="text-green-600 dark:text-green-400 font-medium flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {getFrequencyLabel()}完了
            </span>
          ) : (
            <Button
              size="sm"
              onClick={handleComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              実行
            </Button>
          )}
        </div>
      </div>

      {/* 進捗バー */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className={getProgressTextColor()}>
            {getFrequencyLabel()}の進捗: {routine.executedCount}/{routine.targetCount}回
          </span>
          <span className={getProgressTextColor()}>{Math.round(routine.progress)}%</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(routine.progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
