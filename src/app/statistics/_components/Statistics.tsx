'use client';

import { useEffect, useMemo, useState } from 'react';

import { Card } from '@/components/ui/Card';
import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/lib/db/schema';
// Local interface for statistics display
interface StatisticsData {
  routineId: string;
  routineName: string;
  totalExecutions: number;
  streak: number;
  averageDuration?: number;
  completionRate: number;
  lastExecuted?: Date;
}
import {
  formatDateInUserTimezone,
  getTodayStartInUserTimezone,
  isSameDayInUserTimezone,
} from '@/utils/timezone';


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
        // スケジュールベースのデイリーミッションのみストリークを計算
        if (routine.goalType === 'schedule_based' && routine.recurrenceType === 'daily') {
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

        // ゴールタイプによって違う計算方法
        let targetExecutions: number;
        if (routine.goalType === 'schedule_based') {
          // スケジュールベースの場合は传統的な計算
          targetExecutions = routine.recurrenceType === 'daily' ? 30 : 10;
        } else {
          // 頻度ベースの場合は目標回数を使用
          if (routine.targetPeriod === 'weekly') {
            targetExecutions = (routine.targetCount || 1) * 4; // 4週分
          } else if (routine.targetPeriod === 'monthly') {
            targetExecutions = routine.targetCount || 1;
          } else {
            targetExecutions = 30; // デフォルト
          }
        }
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
  }, [routines, executionRecords, isMounted, userSettings?.timezone]);

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
        <h1 className="text-2xl font-bold text-gray">統計</h1>
        <div className="text-center py-8">
          <p className="text-gray">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray">統計</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue">
              {overallStats.totalRoutines}
            </div>
            <div className="text-sm text-gray">アクティブルーチン</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green">
              {overallStats.totalExecutions}
            </div>
            <div className="text-sm text-gray">総実行回数</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple">
              {overallStats.uniqueExecutedRoutines}
            </div>
            <div className="text-sm text-gray">実行済みルーチン</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange">
              {overallStats.averageExecutionsPerDay}
            </div>
            <div className="text-sm text-gray">1日平均実行数</div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray">ルーチン別統計</h2>

        {statisticsData.length === 0 ? (
          <p className="text-center py-8 text-gray">
            統計データがありません
          </p>
        ) : (
          <div className="space-y-4">
            {statisticsData.map((stat) => (
              <div
                key={stat.routineId}
                className="p-4 rounded-lg border bg-gray border-gray"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray">{stat.routineName}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      stat.completionRate >= 80
                        ? 'bg-green text-green'
                        : stat.completionRate >= 50
                          ? 'bg-yellow text-yellow'
                          : 'bg-red text-red'
                    }`}
                  >
                    達成率 {stat.completionRate}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray">総実行回数</div>
                    <div className="text-lg font-bold text-gray">
                      {stat.totalExecutions}回
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-gray">連続実行</div>
                    <div className="text-lg font-bold text-gray">
                      {stat.streak}日
                    </div>
                  </div>

                  {stat.averageDuration && (
                    <div>
                      <div className="font-medium text-gray">平均時間</div>
                      <div className="text-lg font-bold text-gray">
                        {stat.averageDuration}分
                      </div>
                    </div>
                  )}

                  {stat.lastExecuted && (
                    <div>
                      <div className="font-medium text-gray">最終実行</div>
                      <div className="text-lg font-bold text-gray">
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
