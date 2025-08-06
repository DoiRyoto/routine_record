'use client';

import { useCallback, useState } from 'react';

import { useSnackbar } from '@/context/SnackbarContext';
import { useApiActions } from '@/hooks/useApi';
import type { Routine } from '@/types/routine';

import RoutineList from './RoutineList';

interface Props {
  initialRoutines: Routine[];
}

export default function RoutineClientPage({ initialRoutines }: Props) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const { routines: routineApi } = useApiActions();
  const { showSuccess, showError, showWithAction } = useSnackbar();

  const handleAddRoutine = async (
    routine: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newRoutine = await routineApi.create(routine);
      setRoutines((prev) => [...prev, newRoutine]);
      showSuccess(`「${routine.name}」を作成しました`);
    } catch {
      showError('ルーチンの作成に失敗しました');
    }
  };

  const handleUpdateRoutine = async (id: string, updates: Partial<Routine>) => {
    try {
      const updatedRoutine = await routineApi.update(id, updates);
      if (updatedRoutine) {
        setRoutines((prev) => prev.map((r) => (r.id === id ? updatedRoutine : r)));
        showSuccess(`「${updatedRoutine.name}」を更新しました`);
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
      await routineApi.delete(id);

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
        const restoredRoutine = await routineApi.restore(id);

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
    [routineApi, showSuccess, showError]
  );

  return (
    <div className="space-y-6">
      <RoutineList
        routines={routines}
        onEdit={(routine) => {
          // 更新可能なフィールドのみを抽出

          const {
            id: _id,
            userId: _userId,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            deletedAt: _deletedAt,
            ...updateFields
          } = routine;
          handleUpdateRoutine(routine.id, updateFields);
        }}
        onDelete={handleDeleteRoutine}
        onAdd={handleAddRoutine}
      />
    </div>
  );
}
