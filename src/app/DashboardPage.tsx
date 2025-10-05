'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus } from 'lucide-react';
import type { Habit, HabitLog } from '@/lib/db/schema';

interface DashboardPageProps {
  initialHabits: Habit[];
  initialHabitLogs: HabitLog[];
}

export default function DashboardPage({
  initialHabits,
  initialHabitLogs,
}: DashboardPageProps) {
  const [habits] = useState(initialHabits);
  const [habitLogs] = useState(initialHabitLogs);

  // 今週/今月の進捗を計算する関数
  const getProgress = (habit: Habit) => {
    const now = new Date();
    const currentLogs = habitLogs.filter(log => {
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
    try {
      const response = await fetch('/api/habit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
        }),
      });

      if (!response.ok) throw new Error('Failed to execute habit');
      
      // ページを再読み込みして最新の状態を取得
      window.location.reload();
    } catch (error) {
      console.error('Failed to execute habit:', error);
      alert('習慣の実行記録に失敗しました');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">習慣記録</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          新しい習慣
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const progress = getProgress(habit);
          const progressPercentage = Math.min((progress.current / progress.target) * 100, 100);

          return (
            <Card key={habit.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg">{habit.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {habit.frequencyType === 'weekly' ? '週間' : '月間'}習慣
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => executeHabit(habit.id)}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      今{progress.period}の進捗
                    </span>
                    <span className={`text-sm font-semibold ${progress.isAchieved ? 'text-green-600' : 'text-gray-600'}`}>
                      {progress.current}/{progress.target}回
                      {progress.isAchieved && ' 🎉'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress.isAchieved ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    目標: {progress.period}{habit.targetCount}回
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">まだ習慣が登録されていません</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            最初の習慣を追加
          </Button>
        </div>
      )}
    </div>
  );
}