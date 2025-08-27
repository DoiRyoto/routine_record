'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { ExecutionRecord, Routine } from '@/types/routine';

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
      executedAt: new Date(),
      duration: null,
      memo: null,
      isCompleted: true,
    });
  };

  return (
    <Card 
      className={`transition-all duration-200 p-4 ${
        isCompleted ? 'opacity-60 bg-green-50 border-green-200' : 'hover:shadow-md'
      }`}
    >
      <CardContent>
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
            {isCompleted ? (
              <div className="flex items-center text-green-600 font-medium">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                完了
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleComplete}
                className="font-medium"
              >
                完了
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
