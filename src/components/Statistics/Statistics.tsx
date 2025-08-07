'use client';

import { useEffect, useMemo, useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine, StatisticsData } from '@/types/routine';
import {
  formatDateInUserTimezone,
  getTodayStartInUserTimezone,
  isSameDayInUserTimezone,
} from '@/utils/timezone';

import Card from '../Common/Card';

interface Props {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function Statistics({ routines, executionRecords, userSettings }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const statisticsData = useMemo(() => {
    if (!isMounted) {
      return [];
    } // マウント前は空配列を返す
    return routines
      .map((routine) => {
        const routineRecords = executionRecords.filter(
          (record) => record.routineId === routine.id && record.isCompleted
        );

        const totalExecutions = routineRecords.length;
        const durations = routineRecords
          .filter((r) => r.duration !== undefined)
          .map((r) => r.duration!);
        const averageDuration =
          durations.length > 0
            ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
            : undefined;

        const sortedRecords = routineRecords.sort(
          (a, b) => b.executedAt.getTime() - a.executedAt.getTime()
        );
        const lastExecuted = sortedRecords.length > 0 ? sortedRecords[0].executedAt : undefined;

        let streak = 0;
        if (routine.targetFrequency === 'daily') {
          const timezone = userSettings?.timezone;
          const today = getTodayStartInUserTimezone(timezone);
          const checkDate = new Date(today);

          while (true) {
            const hasRecord = routineRecords.some((record) =>
              isSameDayInUserTimezone(record.executedAt, checkDate, timezone)
            );

            if (hasRecord) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }

        const targetExecutions =
          routine.targetFrequency === 'daily'
            ? 30
            : routine.targetFrequency === 'weekly'
              ? (routine.targetCount || 1) * 4
              : routine.targetCount || 1;
        const completionRate = Math.round((totalExecutions / Math.max(targetExecutions, 1)) * 100);

        return {
          routineId: routine.id,
          routineName: routine.name,
          totalExecutions,
          streak,
          averageDuration,
          completionRate: Math.min(completionRate, 100),
          lastExecuted,
        } as StatisticsData;
      })
      .sort((a, b) => b.totalExecutions - a.totalExecutions);
  }, [routines, executionRecords, isMounted]);

  const overallStats = useMemo(() => {
    if (!isMounted) {
      return {
        totalRoutines: 0,
        totalExecutions: 0,
        uniqueExecutedRoutines: 0,
        averageExecutionsPerDay: 0,
      };
    }
    const totalRoutines = routines.filter((r) => r.isActive).length;
    const totalExecutions = executionRecords.filter((r) => r.isCompleted).length;
    const uniqueExecutedRoutines = new Set(
      executionRecords.filter((r) => r.isCompleted).map((r) => r.routineId)
    ).size;

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentExecutions = executionRecords.filter(
      (record) => record.executedAt >= thirtyDaysAgo && record.isCompleted
    ).length;

    return {
      totalRoutines,
      totalExecutions,
      uniqueExecutedRoutines,
      averageExecutionsPerDay: Math.round((recentExecutions / 30) * 10) / 10,
    };
  }, [routines, executionRecords, isMounted]);

  // マウント前は読み込み中を表示
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">統計</h1>
        <div className="text-center py-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">統計</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {overallStats.totalRoutines}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">アクティブルーチン</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {overallStats.totalExecutions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">総実行回数</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {overallStats.uniqueExecutedRoutines}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">実行済みルーチン</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {overallStats.averageExecutionsPerDay}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">1日平均実行数</div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">ルーチン別統計</h2>

        {statisticsData.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            統計データがありません
          </p>
        ) : (
          <div className="space-y-4">
            {statisticsData.map((stat) => (
              <div
                key={stat.routineId}
                className="p-4 rounded-lg border bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{stat.routineName}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      stat.completionRate >= 80
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : stat.completionRate >= 50
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    達成率 {stat.completionRate}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-300">総実行回数</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.totalExecutions}回
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-gray-600 dark:text-gray-300">連続実行</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.streak}日
                    </div>
                  </div>

                  {stat.averageDuration && (
                    <div>
                      <div className="font-medium text-gray-600 dark:text-gray-300">平均時間</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stat.averageDuration}分
                      </div>
                    </div>
                  )}

                  {stat.lastExecuted && (
                    <div>
                      <div className="font-medium text-gray-600 dark:text-gray-300">最終実行</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatDateInUserTimezone(stat.lastExecuted, userSettings?.timezone, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
