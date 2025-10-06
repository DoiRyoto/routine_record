'use client';

import { Plus } from 'lucide-react';
import * as React from 'react';

import { HabitForm } from '@/components/feature/HabitForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { executeHabitAction } from '@/lib/actions/habit-logs';
import type { Habit, HabitLog } from '@/lib/db/schema';

interface DashboardPageProps {
  habits: Habit[];
  habitLogs: HabitLog[];
}

export default function DashboardPage({
  habits,
  habitLogs,
}: DashboardPageProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [optimisticHabitLogs, addOptimisticHabitLog] = React.useOptimistic(
    habitLogs,
    (state, newLog: HabitLog) => [...state, newLog]
  );

  // 今週/今月の進捗を計算する関数
  const getProgress = (habit: Habit) => {
    const now = new Date();
    const currentLogs = optimisticHabitLogs.filter(log => {
      const logDate = new Date(log.doneAt);
      if (habit.frequencyType === 'weekly') {
        // 今週の記録を取得（月曜日開始）
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        startOfWeek.setHours(0, 0, 0, 0);
        return log.habitId === habit.id && logDate >= startOfWeek;
      } else {
        // 今月の記録を取得
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return log.habitId === habit.id && logDate >= startOfMonth;
      }
    });

    const currentCount = currentLogs.length;
    const targetCount = habit.targetCount;
    const isAchieved = currentCount >= targetCount;

    return {
      current: currentCount,
      target: targetCount,
      isAchieved,
      period: habit.frequencyType === 'weekly' ? '週' : '月'
    };
  };

  // 習慣実行（+ボタン）
  const executeHabit = async (habitId: string) => {
    setErrorMessage(null);

    const optimisticLog: HabitLog = {
      id: `temp-${Date.now()}`,
      habitId,
      doneAt: new Date(),
    };

    addOptimisticHabitLog(optimisticLog);

    const result = await executeHabitAction(habitId);

    if (!result.success) {
      setErrorMessage(result.error || '実行記録の追加に失敗しました');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">習慣記録</h1>
        <Button onClick={() => setIsFormOpen(true)} data-testid="add-habit-button">
          <Plus className="mr-2 h-4 w-4" />
          新しい習慣
        </Button>
      </div>

      {errorMessage && (
        <div
          className="bg-red-50 text-red-800 mb-6 rounded-md p-4 dark:bg-red-900/10 dark:text-red-200"
          data-testid="error-message"
        >
          {errorMessage}
        </div>
      )}

      <HabitForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const progress = getProgress(habit);
          const progressPercentage = Math.min((progress.current / progress.target) * 100, 100);

          return (
            <Card key={habit.id} data-testid="habit-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg" data-testid="habit-title">{habit.name}</CardTitle>
                  <CardDescription>
                    {habit.frequencyType === 'weekly' ? '週間' : '月間'}習慣
                  </CardDescription>
                </div>
                <Button
                  size="icon"
                  onClick={() => executeHabit(habit.id)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      今{progress.period}の進捗
                    </span>
                    <span className="text-sm font-semibold text-black dark:text-white">
                      {progress.current}/{progress.target}回
                    </span>
                  </div>

                  <Progress value={progressPercentage} className="h-2" />

                  <CardDescription className="text-xs">
                    目標: {progress.period}{habit.targetCount}回
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="py-12 text-center">
          <CardDescription className="mb-4">まだ習慣が登録されていません</CardDescription>
          <Button onClick={() => setIsFormOpen(true)} data-testid="add-first-habit-button">
            <Plus className="mr-2 h-4 w-4" />
            最初の習慣を追加
          </Button>
        </div>
      )}
    </div>
  );
}