'use client';

import { useMemo, useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/types/routine';
import {
  getMonthStartInUserTimezone,
  getWeekStartInUserTimezone,
  isSameDayInUserTimezone,
} from '@/utils/timezone';

import Card from '../Common/Card';

import ProgressRoutineItem from './ProgressRoutineItem';
import TodayRoutineItem from './TodayRoutineItem';

interface Props {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function Dashboard({ routines, executionRecords, userSettings }: Props) {
  const [localExecutionRecords, setLocalExecutionRecords] = useState(executionRecords);

  const addExecutionRecord = async (record: Omit<ExecutionRecord, 'id'>) => {
    try {
      const response = await fetch('/api/execution-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error('実行記録の作成に失敗しました');
      }

      const result = await response.json();
      if (result.success) {
        setLocalExecutionRecords((prev) => [...prev, result.data]);
      }
    } catch {
      // 実行記録の作成に失敗
    }
  };

  // ルーティンをタイプ別に分割
  const { dailyRoutines, weeklyRoutines, monthlyRoutines } = useMemo(() => {
    const active = routines.filter((routine) => routine.isActive);

    return {
      dailyRoutines: active.filter((routine) => routine.targetFrequency === 'daily'),
      weeklyRoutines: active.filter((routine) => routine.targetFrequency === 'weekly'),
      monthlyRoutines: active.filter((routine) => routine.targetFrequency === 'monthly'),
    };
  }, [routines]);

  // 今日のルーチンを取得（デイリーのみ）
  const todayRoutines = dailyRoutines;

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

  // ウィークリールーティンの進捗データ
  const weeklyRoutinesWithProgress = useMemo(() => {
    const timezone = userSettings?.timezone;
    const startOfWeek = getWeekStartInUserTimezone(new Date(), timezone);

    return weeklyRoutines.map((routine) => {
      const executedCount = localExecutionRecords.filter(
        (record) =>
          record.routineId === routine.id &&
          record.isCompleted &&
          new Date(record.executedAt) >= startOfWeek
      ).length;

      const targetCount = routine.targetCount || 1;
      const progress = Math.min(executedCount / targetCount, 1);

      return {
        ...routine,
        executedCount,
        targetCount,
        progress: progress * 100, // パーセンテージ
        isCompleted: executedCount >= targetCount,
      };
    });
  }, [weeklyRoutines, localExecutionRecords, userSettings?.timezone]);

  // マンスリールーティンの進捗データ
  const monthlyRoutinesWithProgress = useMemo(() => {
    const timezone = userSettings?.timezone;
    const startOfMonth = getMonthStartInUserTimezone(new Date(), timezone);

    return monthlyRoutines.map((routine) => {
      const executedCount = localExecutionRecords.filter(
        (record) =>
          record.routineId === routine.id &&
          record.isCompleted &&
          new Date(record.executedAt) >= startOfMonth
      ).length;

      const targetCount = routine.targetCount || 1;
      const progress = Math.min(executedCount / targetCount, 1);

      return {
        ...routine,
        executedCount,
        targetCount,
        progress: progress * 100, // パーセンテージ
        isCompleted: executedCount >= targetCount,
      };
    });
  }, [monthlyRoutines, localExecutionRecords, userSettings?.timezone]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>

      {/* 今日のミッション（デイリー） */}
      <Card>
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          デイリーミッション
        </h2>

        {todayRoutines.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            今日実行するデイリーミッションはありません
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

      {/* ウィークリーミッション */}
      {weeklyRoutinesWithProgress.length > 0 && (
        <Card>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            ウィークリーミッション
          </h2>
          <div className="space-y-3">
            {weeklyRoutinesWithProgress.map((routine) => (
              <ProgressRoutineItem
                key={routine.id}
                routine={routine}
                frequencyType="weekly"
                onComplete={addExecutionRecord}
              />
            ))}
          </div>
        </Card>
      )}

      {/* マンスリーミッション */}
      {monthlyRoutinesWithProgress.length > 0 && (
        <Card>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            マンスリーミッション
          </h2>
          <div className="space-y-3">
            {monthlyRoutinesWithProgress.map((routine) => (
              <ProgressRoutineItem
                key={routine.id}
                routine={routine}
                frequencyType="monthly"
                onComplete={addExecutionRecord}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
