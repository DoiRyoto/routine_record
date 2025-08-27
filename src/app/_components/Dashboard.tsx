'use client';

import { useMemo, useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/types/routine';
import {
  getMonthStartInUserTimezone,
  getWeekStartInUserTimezone,
  isSameDayInUserTimezone,
} from '@/utils/timezone';

import { Card } from '@/components/ui/Card';

import CatchupSuggestions from './CatchupSuggestions';
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
  const { scheduleBasedRoutines, frequencyBasedRoutines } = useMemo(() => {
    const active = routines.filter((routine) => routine.isActive);

    return {
      scheduleBasedRoutines: active.filter((routine) => routine.goalType === 'schedule_based'),
      frequencyBasedRoutines: active.filter((routine) => routine.goalType === 'frequency_based'),
    };
  }, [routines]);
  
  // スケジュールベースのルーティンをさらに分類
  const { dailyScheduleRoutines, weeklyScheduleRoutines, monthlyScheduleRoutines } = useMemo(() => {
    return {
      dailyScheduleRoutines: scheduleBasedRoutines.filter((routine) => routine.recurrenceType === 'daily'),
      weeklyScheduleRoutines: scheduleBasedRoutines.filter((routine) => routine.recurrenceType === 'weekly'),
      monthlyScheduleRoutines: scheduleBasedRoutines.filter((routine) => routine.recurrenceType === 'monthly'),
    };
  }, [scheduleBasedRoutines]);

  // 今日のルーチンを取得（デイリースケジュールのみ）
  const todayRoutines = dailyScheduleRoutines;

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

  // 頻度ベースルーティンの進捗データ（週間・月間の回数目標）
  const frequencyBasedRoutinesWithProgress = useMemo(() => {
    const timezone = userSettings?.timezone;
    const now = new Date();
    
    return frequencyBasedRoutines.map((routine) => {
      // 期間の開始日を取得
      let periodStart: Date;
      if (routine.targetPeriod === 'weekly') {
        periodStart = getWeekStartInUserTimezone(now, timezone);
      } else if (routine.targetPeriod === 'monthly') {
        periodStart = getMonthStartInUserTimezone(now, timezone);
      } else {
        // daily の場合は今日から
        periodStart = new Date(now);
        periodStart.setHours(0, 0, 0, 0);
      }
      
      const executedCount = localExecutionRecords.filter(
        (record) =>
          record.routineId === routine.id &&
          record.isCompleted &&
          new Date(record.executedAt) >= periodStart
      ).length;

      const targetCount = routine.targetCount || 1;
      const progress = Math.min(executedCount / targetCount, 1);

      return {
        ...routine,
        executedCount,
        targetCount,
        progress: progress * 100, // パーセンテージ
        isCompleted: executedCount >= targetCount,
        periodType: routine.targetPeriod || 'daily',
      };
    });
  }, [frequencyBasedRoutines, localExecutionRecords, userSettings?.timezone]);


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>

      {/* 挽回プラン提案 */}
      <CatchupSuggestions
        routines={routines}
        executionRecords={localExecutionRecords}
        userSettings={userSettings}
      />

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

      {/* 頻度ベースミッション（週に○回、月に○回） */}
      {frequencyBasedRoutinesWithProgress.length > 0 && (
        <Card>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            頻度ベースミッション
          </h2>
          <div className="space-y-3">
            {frequencyBasedRoutinesWithProgress.map((routine) => (
              <ProgressRoutineItem
                key={routine.id}
                routine={routine}
                frequencyType={routine.periodType as 'weekly' | 'monthly'}
                onComplete={addExecutionRecord}
              />
            ))}
          </div>
        </Card>
      )}
      
      {/* スケジュールベースミッション（週間・月間） */}
      {(weeklyScheduleRoutines.length > 0 || monthlyScheduleRoutines.length > 0) && (
        <Card>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            スケジュールベースミッション
          </h2>
          <div className="space-y-3">
            {/* 週間スケジュール */}
            {weeklyScheduleRoutines.map((routine) => (
              <TodayRoutineItem
                key={routine.id}
                routine={routine}
                isCompleted={todayCompletedRoutineIds.includes(routine.id)}
                onComplete={addExecutionRecord}
              />
            ))}
            {/* 月間スケジュール */}
            {monthlyScheduleRoutines.map((routine) => (
              <TodayRoutineItem
                key={routine.id}
                routine={routine}
                isCompleted={todayCompletedRoutineIds.includes(routine.id)}
                onComplete={addExecutionRecord}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
