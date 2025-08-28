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
    <div className="space-y-6">
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
  );
}