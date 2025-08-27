'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import type { Routine, InsertExecutionRecord } from '@/lib/db/schema';

interface ProgressRoutineItemProps {
  routine: Routine & {
    executedCount: number;
    targetCount: number;
    progress: number;
    isCompleted: boolean;
  };
  frequencyType: 'weekly' | 'monthly';
  onComplete: (record: Omit<InsertExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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


  const getProgressTextColor = () => {
    if (routine.isCompleted) return 'text-green-600';
    if (routine.progress >= 75) return 'text-blue-600';
    if (routine.progress >= 50) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <Card 
      className={`transition-all duration-200 p-4 ${
        routine.isCompleted ? 'opacity-80 bg-green-50 border-green-200' : 'hover:shadow-md'
      }`}
    >
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base mb-1">{routine.name}</h3>
              {routine.description && (
                <p className="text-sm text-gray-600 mb-2">{routine.description}</p>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {routine.category}
              </span>
            </div>

            <div className="ml-4 flex-shrink-0">
              {routine.isCompleted ? (
                <div className="flex items-center text-green-600 font-medium">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {getFrequencyLabel()}完了
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleComplete}
                  className="font-medium"
                >
                  実行
                </Button>
              )}
            </div>
          </div>

          {/* 進捗セクション */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className={getProgressTextColor()}>
                {getFrequencyLabel()}の進捗: {routine.executedCount}/{routine.targetCount}回
              </span>
              <span className={`font-medium ${getProgressTextColor()}`}>
                {Math.round(routine.progress)}%
              </span>
            </div>

            <Progress
              value={routine.progress}
              max={100}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
