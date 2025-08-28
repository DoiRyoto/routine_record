'use client';

import { useCallback, useState } from 'react';

import { useSnackbar } from '@/context/SnackbarContext';
import { apiClient } from '@/lib/api-client/endpoints';
import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { Routine, InsertRoutine } from '@/lib/db/schema';

import RoutineList from './_components/RoutineList';

interface RoutinesPageProps {
  initialRoutines: Routine[];
  userSettings: UserSettingWithTimezone;
}

export default function RoutinesPage({
  initialRoutines,
  userSettings,
}: RoutinesPageProps) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const { showSuccess, showError, showWithAction } = useSnackbar();

  const handleAddRoutine = async (
    routine: Omit<InsertRoutine, 'userId'>
  ) => {
    try {
      // APIリクエスト用に型変換
      const requestData = {
        name: routine.name,
        description: routine.description,
        category: routine.category,
        goalType: routine.goalType!,
        targetCount: routine.targetCount,
        targetPeriod: routine.targetPeriod,
        recurrenceType: routine.recurrenceType!,
        recurrenceInterval: routine.recurrenceInterval === null ? undefined : routine.recurrenceInterval,
        monthlyType: routine.monthlyType,
        dayOfMonth: routine.dayOfMonth,
        weekOfMonth: routine.weekOfMonth,
        dayOfWeek: routine.dayOfWeek,
        daysOfWeek: routine.daysOfWeek,
        startDate: routine.startDate,
        isActive: routine.isActive,
      };
      
      const result = await apiClient.routines.create(requestData);
      
      if (result.success && result.data) {
        setRoutines((prev) => [...prev, result.data!]);
        showSuccess(`「${routine.name}」を作成しました`);
      }
    } catch (error) {
      console.error('ルーチンの作成に失敗しました:', error);
      showError('ルーチンの作成に失敗しました');
    }
  };

  const handleUpdateRoutine = async (id: string, updates: Partial<Routine>) => {
    try {
      // APIリクエスト用に型変換（nullをundefinedに変換など）
      const requestData = {
        ...(updates.name && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.category && { category: updates.category }),
        ...(updates.goalType && { goalType: updates.goalType }),
        ...(updates.targetCount !== undefined && { targetCount: updates.targetCount }),
        ...(updates.targetPeriod !== undefined && { targetPeriod: updates.targetPeriod }),
        ...(updates.recurrenceType && { recurrenceType: updates.recurrenceType }),
        ...(updates.recurrenceInterval !== undefined && { recurrenceInterval: updates.recurrenceInterval === null ? undefined : updates.recurrenceInterval }),
        ...(updates.monthlyType !== undefined && { monthlyType: updates.monthlyType }),
        ...(updates.dayOfMonth !== undefined && { dayOfMonth: updates.dayOfMonth }),
        ...(updates.weekOfMonth !== undefined && { weekOfMonth: updates.weekOfMonth }),
        ...(updates.dayOfWeek !== undefined && { dayOfWeek: updates.dayOfWeek }),
        ...(updates.daysOfWeek !== undefined && { daysOfWeek: updates.daysOfWeek }),
        ...(updates.startDate !== undefined && { startDate: updates.startDate }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive }),
      };
      
      const result = await apiClient.routines.update(id, requestData);
      
      if (result.success && result.data) {
        setRoutines((prev) => prev.map((r) => (r.id === id ? result.data! : r)));
        showSuccess(`「${result.data!.name}」を更新しました`);
      }
    } catch (error) {
      console.error('ルーチンの更新に失敗しました:', error);
      showError('ルーチンの更新に失敗しました');
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    const routineToDelete = routines.find((r) => r.id === id);
    if (!routineToDelete) {
      return;
    }

    try {
      await apiClient.routines.delete(id);

      // UIから削除
      setRoutines((prev) => prev.filter((r) => r.id !== id));

      // Undo機能付きSnackbarを表示（5秒）
      showWithAction(
        `「${routineToDelete.name}」を削除しました`,
        'warning',
        '元に戻す',
        () => handleUndoDelete(id, routineToDelete),
        5000
      );
    } catch (error) {
      console.error('ルーチンの削除に失敗しました:', error);
      showError('ルーチンの削除に失敗しました');
    }
  };

  const handleUndoDelete = useCallback(
    async (id: string, _routine: Routine) => {
      try {
        const result = await apiClient.routines.restore(id);
        
        if (result.success && result.data) {
          const restoredRoutine = result.data;

          // UIに復元
          setRoutines((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            if (existingIds.has(restoredRoutine.id)) {
              return prev;
            }

            return [...prev, restoredRoutine].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          showSuccess(`「${restoredRoutine.name}」を復元しました`);
        }
      } catch (error) {
        console.error('ルーチンの復元に失敗しました:', error);
        showError('ルーチンの復元に失敗しました');
      }
    },
    [showSuccess, showError]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green/5 to-teal/10 dark:from-black dark:via-green/5 dark:to-teal/10">
      <div className="container mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green/90 to-teal/90 text-white rounded-2xl p-6 shadow-xl backdrop-blur-md border border-white/20 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  ルーチン管理
                </h1>
                <p className="text-white/80">
                  習慣を作って、継続的な成長を目指しましょう
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ルーチンリスト */}
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
          <div className="p-6">
            <RoutineList
              routines={routines}
              userSettings={userSettings}
              onEdit={(routine) => {
                // 更新可能なフィールドのみを抽出
                const updateFields = {
                  name: routine.name,
                  description: routine.description,
                  category: routine.category,
                  goalType: routine.goalType,
                  targetCount: routine.targetCount,
                  targetPeriod: routine.targetPeriod,
                  recurrenceType: routine.recurrenceType,
                  recurrenceInterval: routine.recurrenceInterval,
                  isActive: routine.isActive,
                };
                handleUpdateRoutine(routine.id, updateFields);
              }}
              onDelete={handleDeleteRoutine}
              onAdd={handleAddRoutine}
            />
          </div>
        </div>
      </div>
    </div>
  );
}