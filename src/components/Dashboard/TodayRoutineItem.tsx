'use client';

import type { ExecutionRecord, Routine } from '@/types/routine';

import Button from '../Common/Button';

interface TodayRoutineItemProps {
  routine: Routine;
  isCompleted: boolean;
  onComplete: (record: Omit<ExecutionRecord, 'id'>) => Promise<void>;
}

export default function TodayRoutineItem({
  routine,
  isCompleted,
  onComplete,
}: TodayRoutineItemProps) {
  const handleComplete = async () => {
    await onComplete({
      routineId: routine.id,
      executedAt: new Date(), // 単純に現在時刻を使用（データベースでタイムゾーン付きで保存される）
      duration: null,
      memo: null,
      isCompleted: true,
    });
  };

  return (
    <div
      className={`p-4 rounded-lg border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">{routine.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{routine.description}</p>
          <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {routine.category}
          </span>
        </div>

        <div className="ml-4">
          {isCompleted ? (
            <span className="text-green-600 dark:text-green-400 font-medium">✓ 完了</span>
          ) : (
            <Button
              size="sm"
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              完了
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
