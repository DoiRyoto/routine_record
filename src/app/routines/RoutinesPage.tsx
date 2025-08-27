'use client';

import { useCallback, useState } from 'react';

import { useSnackbar } from '@/context/SnackbarContext';
import type { Routine, UserSetting } from '@/lib/db/schema';

import RoutineList from './_components/RoutineList';

interface RoutinesPageProps {
  initialRoutines: Routine[];
  userSettings: UserSetting;
}

export default function RoutinesPage({
  initialRoutines,
  userSettings,
}: RoutinesPageProps) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const { showSuccess, showError, showWithAction } = useSnackbar();

  const handleAddRoutine = async (
    routine: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routine),
      });

      if (!response.ok) {
        throw new Error('ルーチンの作成に失敗しました');
      }

      const result = await response.json();
      if (result.success) {
        setRoutines((prev) => [...prev, result.data]);
        showSuccess(`「${routine.name}」を作成しました`);
      }
    } catch {
      showError('ルーチンの作成に失敗しました');
    }
  };

  const handleUpdateRoutine = async (id: string, updates: Partial<Routine>) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('ルーチンの更新に失敗しました');
      }

      const result = await response.json();
      if (result.success) {
        setRoutines((prev) => prev.map((r) => (r.id === id ? result.data : r)));
        showSuccess(`「${result.data.name}」を更新しました`);
      }
    } catch {
      showError('ルーチンの更新に失敗しました');
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    const routineToDelete = routines.find((r) => r.id === id);
    if (!routineToDelete) {
      return;
    }

    try {
      // 即座にAPIでソフトデリート実行
      const response = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('ルーチンの削除に失敗しました');
      }

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
    } catch {
      showError('ルーチンの削除に失敗しました');
    }
  };

  const handleUndoDelete = useCallback(
    async (id: string, _routine: Routine) => {
      try {
        // APIで復元
        const response = await fetch(`/api/routines/${id}/restore`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('ルーチンの復元に失敗しました');
        }

        const result = await response.json();
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
      } catch {
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