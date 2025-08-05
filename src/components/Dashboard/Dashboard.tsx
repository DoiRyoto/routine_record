'use client';

import React, { useMemo, useState } from 'react';
import { Routine, ExecutionRecord } from '@/types/routine';
import { useApiActions } from '@/hooks/useApi';
import ProgressCard from './ProgressCard';
import TodayRoutineItem from './TodayRoutineItem';
import Card from '../Common/Card';

interface Props {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
}

export default function Dashboard({ routines, executionRecords }: Props) {
  const { executionRecords: executionRecordsApi } = useApiActions();
  const [localExecutionRecords, setLocalExecutionRecords] = useState(executionRecords);

  const addExecutionRecord = async (record: Omit<ExecutionRecord, 'id'>) => {
    try {
      const newRecord = await executionRecordsApi.create(record);
      setLocalExecutionRecords(prev => [...prev, newRecord]);
    } catch (error) {
      console.error('実行記録の作成に失敗しました:', error);
    }
  };

  // 今日のルーチンを取得
  const todayRoutines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return routines.filter(routine => {
      if (!routine.isActive) return false;
      
      switch (routine.targetFrequency) {
        case 'daily':
          return true;
        case 'weekly':
          // 今週のルーチンかどうかを判定
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          
          const weeklyCount = localExecutionRecords.filter(record => 
            record.routineId === routine.id && 
            new Date(record.executedAt) >= startOfWeek
          ).length;
          
          return weeklyCount < (routine.targetCount || 1);
        case 'monthly':
          // 今月のルーチンかどうかを判定
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          
          const monthlyCount = localExecutionRecords.filter(record => 
            record.routineId === routine.id && 
            new Date(record.executedAt) >= startOfMonth
          ).length;
          
          return monthlyCount < (routine.targetCount || 1);
        default:
          return true;
      }
    });
  }, [routines, localExecutionRecords]);

  // 今日完了したルーチンのID一覧
  const todayCompletedRoutineIds = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return localExecutionRecords
      .filter(record => {
        const recordDate = new Date(record.executedAt);
        return recordDate >= today && recordDate < tomorrow && record.isCompleted;
      })
      .map(record => record.routineId);
  }, [localExecutionRecords]);

  // 今日の進捗
  const todayProgress = useMemo(() => {
    const completed = todayCompletedRoutineIds.length;
    const total = todayRoutines.length;
    return { completed, total };
  }, [todayCompletedRoutineIds, todayRoutines]);

  // 今週の進捗
  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyRecords = localExecutionRecords.filter(record => {
      const recordDate = new Date(record.executedAt);
      return recordDate >= startOfWeek && record.isCompleted;
    });
    
    const completed = weeklyRecords.length;
    const total = routines.filter(r => r.isActive).length * 7; // 簡単な計算
    
    return { completed, total };
  }, [localExecutionRecords, routines]);

  // 今月の進捗
  const monthlyProgress = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyRecords = localExecutionRecords.filter(record => {
      const recordDate = new Date(record.executedAt);
      return recordDate >= startOfMonth && record.isCompleted;
    });
    
    const completed = monthlyRecords.length;
    const total = routines.filter(r => r.isActive).length * 30; // 簡単な計算
    
    return { completed, total };
  }, [localExecutionRecords, routines]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        ダッシュボード
      </h1>

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
        <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          今日のルーチン
        </h2>
        
        {todayRoutines.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            今日実行するルーチンはありません
          </p>
        ) : (
          <div className="space-y-3">
            {todayRoutines.map(routine => (
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