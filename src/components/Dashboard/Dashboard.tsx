'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRoutine } from '@/context/RoutineContext';
import ProgressCard from './ProgressCard';
import TodayRoutineItem from './TodayRoutineItem';
import Card from '../Common/Card';

export default function Dashboard() {
  const { routines, executionRecords } = useRoutine();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dashboardData = useMemo(() => {
    if (!isMounted) return { 
      todayRoutines: [], 
      todayProgress: { completed: 0, total: 0 },
      weeklyProgress: { completed: 0, total: 0 },
      monthlyProgress: { completed: 0, total: 0 }
    };
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const activeRoutines = routines.filter(r => r.isActive);
    
    const todayRecords = executionRecords.filter(record => 
      record.executedAt >= todayStart && 
      record.executedAt < todayEnd &&
      record.isCompleted
    );

    const weekRecords = executionRecords.filter(record => 
      record.executedAt >= weekStart && 
      record.executedAt < weekEnd &&
      record.isCompleted
    );

    const monthRecords = executionRecords.filter(record => 
      record.executedAt >= monthStart && 
      record.executedAt < monthEnd &&
      record.isCompleted
    );

    const todayRoutines = activeRoutines.filter(routine => {
      if (routine.targetFrequency === 'daily') return true;
      if (routine.targetFrequency === 'weekly') {
        const weeklyRecords = weekRecords.filter(r => r.routineId === routine.id);
        return weeklyRecords.length < (routine.targetCount || 1);
      }
      if (routine.targetFrequency === 'monthly') {
        const monthlyRecords = monthRecords.filter(r => r.routineId === routine.id);
        return monthlyRecords.length < (routine.targetCount || 1);
      }
      return true;
    });

    return {
      todayRoutines,
      todayProgress: {
        completed: todayRecords.length,
        total: todayRoutines.length,
      },
      weeklyProgress: {
        completed: weekRecords.length,
        total: activeRoutines.filter(r => r.targetFrequency === 'daily').length * 7 +
               activeRoutines.filter(r => r.targetFrequency === 'weekly').reduce((sum, r) => sum + (r.targetCount || 1), 0),
      },
      monthlyProgress: {
        completed: monthRecords.length,
        total: activeRoutines.filter(r => r.targetFrequency === 'daily').length * 30 +
               activeRoutines.filter(r => r.targetFrequency === 'weekly').reduce((sum, r) => sum + (r.targetCount || 1) * 4, 0) +
               activeRoutines.filter(r => r.targetFrequency === 'monthly').reduce((sum, r) => sum + (r.targetCount || 1), 0),
      },
    };
  }, [routines, executionRecords, isMounted]);

  const getTodayCompletedRoutines = useMemo(() => {
    if (!isMounted) return new Set();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayRecords = executionRecords.filter(record => 
      record.executedAt >= todayStart && 
      record.executedAt < todayEnd &&
      record.isCompleted
    );

    return new Set(todayRecords.map(r => r.routineId));
  }, [executionRecords, isMounted]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressCard
          title="今日の進捗"
          completed={dashboardData.todayProgress.completed}
          total={dashboardData.todayProgress.total}

        />
        <ProgressCard
          title="今週の進捗"
          completed={dashboardData.weeklyProgress.completed}
          total={dashboardData.weeklyProgress.total}

        />
        <ProgressCard
          title="今月の進捗"
          completed={dashboardData.monthlyProgress.completed}
          total={dashboardData.monthlyProgress.total}

        />
      </div>

              <Card>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          今日のルーチン
        </h2>
        
        {dashboardData.todayRoutines.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            今日のルーチンはありません
          </p>
        ) : (
          <div className="space-y-3">
            {dashboardData.todayRoutines.map(routine => (
              <TodayRoutineItem
                key={routine.id}
                routine={routine}
                isCompleted={getTodayCompletedRoutines.has(routine.id)}
      
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}