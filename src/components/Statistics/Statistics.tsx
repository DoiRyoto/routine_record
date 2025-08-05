'use client';

import React, { useMemo } from 'react';
import { useRoutine } from '@/context/RoutineContext';
import { StatisticsData } from '@/types/routine';
import Card from '../Common/Card';

export default function Statistics() {
  const { routines, executionRecords, isDarkMode } = useRoutine();

  const statisticsData = useMemo(() => {
    return routines.map(routine => {
      const routineRecords = executionRecords.filter(record => 
        record.routineId === routine.id && record.isCompleted
      );
      
      const totalExecutions = routineRecords.length;
      const durations = routineRecords
        .filter(r => r.duration !== undefined)
        .map(r => r.duration!);
      const averageDuration = durations.length > 0 
        ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
        : undefined;
      
      const sortedRecords = routineRecords.sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());
      const lastExecuted = sortedRecords.length > 0 ? sortedRecords[0].executedAt : undefined;
      
      let streak = 0;
      if (routine.targetFrequency === 'daily') {
        const today = new Date();
        let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        while (true) {
          const dayStart = new Date(checkDate);
          const dayEnd = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000);
          
          const hasRecord = routineRecords.some(record => 
            record.executedAt >= dayStart && record.executedAt < dayEnd
          );
          
          if (hasRecord) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
      
      const targetExecutions = routine.targetFrequency === 'daily' ? 30 :
                              routine.targetFrequency === 'weekly' ? (routine.targetCount || 1) * 4 :
                              routine.targetCount || 1;
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
    }).sort((a, b) => b.totalExecutions - a.totalExecutions);
  }, [routines, executionRecords]);

  const overallStats = useMemo(() => {
    const totalRoutines = routines.filter(r => r.isActive).length;
    const totalExecutions = executionRecords.filter(r => r.isCompleted).length;
    const uniqueExecutedRoutines = new Set(
      executionRecords.filter(r => r.isCompleted).map(r => r.routineId)
    ).size;
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentExecutions = executionRecords.filter(record => 
      record.executedAt >= thirtyDaysAgo && record.isCompleted
    ).length;
    
    return {
      totalRoutines,
      totalExecutions,
      uniqueExecutedRoutines,
      averageExecutionsPerDay: Math.round(recentExecutions / 30 * 10) / 10,
    };
  }, [routines, executionRecords]);

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        統計
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card isDarkMode={isDarkMode}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {overallStats.totalRoutines}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              アクティブルーチン
            </div>
          </div>
        </Card>

        <Card isDarkMode={isDarkMode}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              {overallStats.totalExecutions}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              総実行回数
            </div>
          </div>
        </Card>

        <Card isDarkMode={isDarkMode}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {overallStats.uniqueExecutedRoutines}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              実行済みルーチン
            </div>
          </div>
        </Card>

        <Card isDarkMode={isDarkMode}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {overallStats.averageExecutionsPerDay}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              1日平均実行数
            </div>
          </div>
        </Card>
      </div>

      <Card isDarkMode={isDarkMode}>
        <h2 className={`text-xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          ルーチン別統計
        </h2>

        {statisticsData.length === 0 ? (
          <p className={`text-center py-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            統計データがありません
          </p>
        ) : (
          <div className="space-y-4">
            {statisticsData.map(stat => (
              <div
                key={stat.routineId}
                className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.routineName}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    stat.completionRate >= 80
                      ? isDarkMode
                        ? 'bg-green-900 text-green-200'
                        : 'bg-green-100 text-green-800'
                      : stat.completionRate >= 50
                        ? isDarkMode
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-yellow-100 text-yellow-800'
                        : isDarkMode
                          ? 'bg-red-900 text-red-200'
                          : 'bg-red-100 text-red-800'
                  }`}>
                    達成率 {stat.completionRate}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      総実行回数
                    </div>
                    <div className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.totalExecutions}回
                    </div>
                  </div>

                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      連続実行
                    </div>
                    <div className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.streak}日
                    </div>
                  </div>

                  {stat.averageDuration && (
                    <div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        平均時間
                      </div>
                      <div className={`text-lg font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.averageDuration}分
                      </div>
                    </div>
                  )}

                  {stat.lastExecuted && (
                    <div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        最終実行
                      </div>
                      <div className={`text-lg font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.lastExecuted.toLocaleDateString('ja-JP', {
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