'use client';

import { useMemo, useState } from 'react';

import { useApiActions } from '@/hooks/useApi';
import { useUserSettings } from '@/hooks/useUserSettings';
import type { ExecutionRecord, Routine } from '@/types/routine';
import {
  getMonthStartInUserTimezone,
  getWeekStartInUserTimezone,
  isSameDayInUserTimezone,
} from '@/utils/timezone';

import Card from '../Common/Card';

import ProgressCard from './ProgressCard';
import TodayRoutineItem from './TodayRoutineItem';

interface Props {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
}

export default function Dashboard({ routines, executionRecords }: Props) {
  const { executionRecords: executionRecordsApi } = useApiActions();
  const { userSettings } = useUserSettings();
  const [localExecutionRecords, setLocalExecutionRecords] = useState(executionRecords);

  const addExecutionRecord = async (record: Omit<ExecutionRecord, 'id'>) => {
    try {
      const newRecord = await executionRecordsApi.create(record);
      setLocalExecutionRecords((prev) => [...prev, newRecord]);
    } catch {
      // 実行記録の作成に失敗
    }
  };

  // 今日のルーチンを取得
  const todayRoutines = useMemo(() => {
    const timezone = userSettings?.timezone;

    return routines.filter((routine) => {
      if (!routine.isActive) {
        return false;
      }

      switch (routine.targetFrequency) {
        case 'daily':
          return true;
        case 'weekly':
          // 今週のルーチンかどうかを判定
          const startOfWeek = getWeekStartInUserTimezone(new Date(), timezone);

          const weeklyCount = localExecutionRecords.filter(
            (record) =>
              record.routineId === routine.id && new Date(record.executedAt) >= startOfWeek
          ).length;

          return weeklyCount < (routine.targetCount || 1);
        case 'monthly':
          // 今月のルーチンかどうかを判定
          const startOfMonth = getMonthStartInUserTimezone(new Date(), timezone);

          const monthlyCount = localExecutionRecords.filter(
            (record) =>
              record.routineId === routine.id && new Date(record.executedAt) >= startOfMonth
          ).length;

          return monthlyCount < (routine.targetCount || 1);
        default:
          return true;
      }
    });
  }, [routines, localExecutionRecords, userSettings?.timezone]);

  // 今日完了したルーチンのID一覧
  const todayCompletedRoutineIds = useMemo(() => {
    const timezone = userSettings?.timezone;
    const today = new Date();

    return localExecutionRecords
      .filter((record) => {
        return record.isCompleted && isSameDayInUserTimezone(record.executedAt, today, timezone);
      })
      .map((record) => record.routineId);
  }, [localExecutionRecords, userSettings?.timezone]);

  // 今日の進捗
  const todayProgress = useMemo(() => {
    const completed = todayCompletedRoutineIds.length;
    const total = todayRoutines.length;
    return { completed, total };
  }, [todayCompletedRoutineIds, todayRoutines]);

  // 今週の進捗
  const weeklyProgress = useMemo(() => {
    const timezone = userSettings?.timezone;
    const startOfWeek = getWeekStartInUserTimezone(new Date(), timezone);

    const weeklyRecords = localExecutionRecords.filter((record) => {
      return new Date(record.executedAt) >= startOfWeek && record.isCompleted;
    });

    const completed = weeklyRecords.length;
    const total = routines.filter((r) => r.isActive).length * 7; // 簡単な計算

    return { completed, total };
  }, [localExecutionRecords, routines, userSettings?.timezone]);

  // 今月の進捗
  const monthlyProgress = useMemo(() => {
    const timezone = userSettings?.timezone;
    const startOfMonth = getMonthStartInUserTimezone(new Date(), timezone);

    const monthlyRecords = localExecutionRecords.filter((record) => {
      return new Date(record.executedAt) >= startOfMonth && record.isCompleted;
    });

    const completed = monthlyRecords.length;
    const total = routines.filter((r) => r.isActive).length * 30; // 簡単な計算

    return { completed, total };
  }, [localExecutionRecords, routines, userSettings?.timezone]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>

      {/* 進捗カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressCard
          title="今日の進捗"
          completed={todayProgress.completed}
          total={todayProgress.total}
          color="blue"
        />
        <ProgressCard
          title="今週の進捗"
          completed={weeklyProgress.completed}
          total={weeklyProgress.total}
          color="green"
        />
        <ProgressCard
          title="今月の進捗"
          completed={monthlyProgress.completed}
          total={monthlyProgress.total}
          color="purple"
        />
      </div>

      {/* 今日のルーチン */}
      <Card>
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">今日のルーチン</h2>

        {todayRoutines.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            今日実行するルーチンはありません
          </p>
        ) : (
          <div className="space-y-3">
            {todayRoutines.map((routine) => (
              <TodayRoutineItem
                key={routine.id}
                routine={routine}
                isCompleted={todayCompletedRoutineIds.includes(routine.id)}
                onComplete={addExecutionRecord}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
